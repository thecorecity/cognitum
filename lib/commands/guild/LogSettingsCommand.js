const BaseCommand = require("../../classes/base/commands/BaseCommand");
const GuildCategory = require("../../categories/GuildCategory");
const CheckList = require("../../classes/content/CheckList");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const ArgumentError = require("../../classes/errors/ArgumentError");
const { GuildModel } = require("../../classes/Database");
const { escapeMarkdown } = require("../../classes/Utils");
const InvalidLoggingChannelError = require("../../classes/errors/commands/InvalidLoggingChannelError");
const { ChannelType } = require("discord-api-types/v10");
const { PermissionsBitField } = require("discord.js");

class LogSettingsCommand extends BaseCommand {
	async run() {
		if (this.args.length === 0)
			return await this.showLogsSettings();
		if (this.args.length === 1 && /^(enable|disable)$/.test(this.args[0]))
			return await this.toggleLogging(this.args[0] === "enable");
		if (this.args.length === 1 && /^(public|private)$/.test(this.args[0]))
			return await this.resetLogChannel();
		if (this.args.length === 2) {
			if (/^(enable|disable)$/.test(this.args[0]))
				return await this.toggleSetting(this.args[1], this.args[0] === "enable");
			if (/^(public|private)$/.test(this.args[0]))
				return await this.setLogChannel(this.args[0], this.args[1]);
		}
		// TODO Special error for this
		throw new Error("Incorrect command usage!");
	}

	/**
	 * Show all log setting for this command.
	 * @return {Promise<DefaultEmbed>}
	 */
	async showLogsSettings() {
		const guild = this.context.models.guild;
		const typesMap = this.constructor.logTypesMap;
		const replyEmbed = new DefaultEmbed(this.context, "guild");
		const generalSettings = new CheckList();
		const logsEnabled = guild.logs_enabled === 1;
		const publicChannelSet = /^\d+$/.test(guild.logs_public_channel);
		const privateChannelSet = /^\d+$/.test(guild.logs_private_channel);
		generalSettings.push(...[
			{
				state: logsEnabled,
				text: this.resolveLang(
					`command.log.state.${logsEnabled ? "enabled" : "disabled"}`
				)
			},
			{
				state: /^\d+$/.test(guild.logs_public_channel),
				text: this.resolveLang(
					`command.log.channel.public.${publicChannelSet ? "enabled" : "disabled"}`,
					{
						channelId: guild.logs_public_channel
					}
				)
			},
			{
				state: /^\d+$/.test(guild.logs_private_channel),
				text: this.resolveLang(
					`command.log.channel.private.${privateChannelSet ? "enabled" : "disabled"}`,
					{
						channelId: guild.logs_private_channel
					}
				)
			}
		]);
		const eventsList = new CheckList();
		for (const tableField in typesMap) {
			if (!typesMap.hasOwnProperty(tableField))
				continue;
			const state = (guild[tableField] ?? null) === 1;
			eventsList.push({
				state,
				text: this.resolveLang(`command.log.events.${typesMap[tableField]}`)
			});
		}
		replyEmbed
			.setTitle(
				this.resolveLang("command.log.settingsTitle", {
					guildName: this.message.guild.name
				})
			)
			.setDescription(
				generalSettings.toString()
			)
			.addFields({
				name: this.resolveLang("command.log.settingsEvents"),
				value: eventsList.toString()
			});
		return replyEmbed;
	}

	/**
	 * Reset log channel of this type.
	 * @return {Promise<DefaultEmbed>}
	 */
	async resetLogChannel() {
		return this.setLogChannel(this.args[0], null);
	}

	/**
	 * Toggle log setting for guild.
	 * @param {string} settingCode Target setting code.
	 * @param {boolean} state
	 * @return {Promise<DefaultEmbed>}
	 */
	async toggleSetting(settingCode, state) {
		let properties = [];
		properties.push(settingCode);

		if (settingCode === "all")
			properties = Object.keys(this.constructor.logTypesInvertedMap);

		const guildInstance = this.context.models.guild;

		properties.forEach(setting => {
			if (!this.constructor.logTypesInvertedMap.hasOwnProperty(setting))
				throw new ArgumentError("valueList", {
					argumentPassed: setting,
					argumentExpectedList: Object.keys(this.constructor.logTypesInvertedMap)
						.map(v => escapeMarkdown(v))
						.join(", ")
				});

			guildInstance.set(
				this.constructor.logTypesInvertedMap[setting],
				state ? 1 : 0
			);
		});

		await guildInstance.save();
		const reply = new DefaultEmbed(this.context, "guild");
		const check = new CheckList();

		check.push({ state, text: this.resolveLang(`command.log.events.${settingCode}`) });

		reply
			.setTitle(
				this.resolveLang("command.log.eventChanged.title")
			)
			.setDescription(
				this.resolveLang("command.log.eventChanged.description", {
					feature: check.toString()
				})
			);

		return reply;
	}

	/**
	 * Set log channel for current guild.
	 * @param {"private"|"public"} type Log type for this channel.
	 * @param {string|null} channelId Channel ID for log channel to set.
	 * @return {Promise<DefaultEmbed>}
	 */
	async setLogChannel(type, channelId) {
		if (!/(public|private)/.test(type))
			throw new Error("Incorrect channel type for logs!");

		/** @type {import("discord.js").GuildChannel | null} */
		let targetChannel = null;

		if (channelId !== null) {
			channelId = /(?:<#)?(?<id>\d+)>?/.exec(channelId)?.groups.id ?? null;

			// Case: Channel ID is not resolved at all
			if (channelId === null)
				throw new InvalidLoggingChannelError("invalidChannelId");

			targetChannel = this.message.guild?.channels.cache.find(channel => channel.id === channelId);

			// Case: Channel not found or not viewable
			if (!targetChannel || !targetChannel.viewable)
				throw new InvalidLoggingChannelError("missingChannel", channelId);

			// Case: Unusual channel type (e. g.: announcements, thread channels)
			if (this.constructor._unusualChannelTypes.has(targetChannel.type))
				throw new InvalidLoggingChannelError("unusualChannelType", channelId);

			// Case: Other non-text channels
			if (targetChannel.type !== ChannelType.GuildText)
				throw new InvalidLoggingChannelError("invalidChannel", channelId);
		}

		await GuildModel.update({
			[`logs_${type}_channel`]: channelId
		}, {
			where: {
				id: this.message.guild.id
			}
		});

		return new DefaultEmbed(this.context, "guild")
			.setTitle(
				this.resolveLang(
					"command.log.settingsChangedTitle",
					{
						guildName: this.message.guild.name
					}
				)
			)
			.setDescription(
				this.resolveLang(
					`command.log.channel.${type}.${targetChannel?.type === ChannelType.GuildText ? "set" : "reset"}`,
					{
						channelName: targetChannel?.name,
						channelId: targetChannel?.id
					}
				)
			);
	}

	/**
	 * Toggle logging feature.
	 * @param {boolean} state
	 * @return {Promise<DefaultEmbed>}
	 */
	async toggleLogging(state) {
		const guildInstance = this.context.models.guild;
		guildInstance.logs_enabled = state ? 1 : 0;
		await guildInstance.save();
		const reply = new DefaultEmbed(this.context, "guild");
		reply.setTitle(
			this.resolveLang(`command.log.toggle.${state ? "on" : "off"}.title`)
		).setDescription(
			this.resolveLang(`command.log.toggle.${state ? "on" : "off"}.description`)
		);
		return reply;
	}

	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			values: [
				["enable", "disable", "private", "public"]
			],
			max: 2
		},
		callerPermission: PermissionsBitField.Flags.Administrator
	};

	static category = GuildCategory.getCode();
	static code = "log";
	static aliases = ["logs"];
	static examples = [
		"example.enable",
		"example.disable",
		"example.setPublicChannel",
		"example.resetPrivateChannel",
		"example.enableFeature",
		"example.disableFeature",
		"example.enableAll"
	];
	static usage = "log [ public [<channel>] | private [<channel>] | enable { <feature> | all } | disable { <feature> | all } ]";

	/**
	 * Map of events. Key is database table field. Value is actual code for calling.
	 */
	static logTypesMap = {
		logs_join_event: "join",
		logs_left_event: "left",
		logs_rename_event: "rename",
		logs_kick_event: "kick",
		logs_ban_event: "ban",
		logs_msgdelete_event: "msg_delete",
		logs_msgimage_event: "msg_image",
		logs_msgupdate_event: "msg_update"
	};

	static logTypesInvertedMap = {
		join: "logs_join_event",
		left: "logs_left_event",
		rename: "logs_rename_event",
		kick: "logs_kick_event",
		ban: "logs_ban_event",
		msg_delete: "logs_msgdelete_event",
		msg_image: "logs_msgimage_event",
		msg_update: "logs_msgupdate_event"
	};

	/**
	 * @type {Set<import('discord.js').TextBasedChannelTypes>}
	 * @private
	 */
	static _unusualChannelTypes = new Set([
		ChannelType.GuildNews,
		ChannelType.GuildNewsThread,
		ChannelType.GuildPublicThread,
		ChannelType.GuildPrivateThread
	]);
}

module.exports = LogSettingsCommand;
