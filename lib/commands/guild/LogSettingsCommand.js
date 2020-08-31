const BaseCommand = require("../BaseCommand.js");
const GuildCategory = require("../../categories/GuildCategory.js");
const CheckList = require("../../classes/content/CheckList.js");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed.js");
const { Guild } = require("../../classes/Database.js");

class LogSettingsCommand extends BaseCommand {
	async run() {
		if (this.args.length === 0)
			return await this.showLogsSettings();
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
		const guild = this.context.getGuildInstance();
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
				state: /^\d+$/.test(guild["logs_public_channel"]),
				text: this.resolveLang(
					`command.log.channel.public.${publicChannelSet ? "enabled" : "disabled"}`,
					{
						channelId: guild["logs_public_channel"]
					}
				)
			},
			{
				state: /^\d+$/.test(guild["logs_private_channel"]),
				text: this.resolveLang(
					`command.log.channel.private.${privateChannelSet ? "enabled" : "disabled"}`,
					{
						channelId: guild["logs_private_channel"]
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
			.addField(
				this.resolveLang("command.log.settingsEvents"),
				eventsList.toString()
			);
		return replyEmbed;
	}

	/**
	 * Reset log channel of this type.
	 * @return {Promise<void>}
	 */
	async resetLogChannel() {
		return this.setLogChannel(this.args[0], null);
	}

	/**
	 * Toggle log setting for guild.
	 * @param {string} settingCode
	 * @param {boolean} state
	 * @return {Promise<void>}
	 */
	async toggleSetting(settingCode, state) {
		throw new Error("Not implemented yet!");
	}

	/**
	 * Set log channel for current guild.
	 * @param {"private"|"public"} type Log type for this channel.
	 * @param {string|null} channelID Channel ID for log channel to set.
	 * @return {Promise<DefaultEmbed>}
	 */
	async setLogChannel(type, channelID) {
		if (!/(public|private)/.test(type))
			throw new Error("Incorrect channel type for logs!");
		/** @type {import("discord.js").GuildChannel | null} */
		let targetChannel = null;
		if (channelID !== null) {
			channelID = /(\d+)/.exec(channelID)?.[0] ?? null;
			if (channelID === null)
				throw new Error("Incorrect channel ID passed! This argument must contains Channel ID!");
			targetChannel = this.message.guild?.channels.cache.find(channel => channel.id === channelID);
			if (!targetChannel || targetChannel.type !== "text" || !targetChannel.viewable)
				throw new Error("This channel is not exist or it is not viewable by bot!");
		}
		await Guild.update({
			[`logs_${type}_channel`]: channelID
		}, {
			where: {
				id: this.message.guild.id
			}
		});
		const replyEmbed = new DefaultEmbed(this.context, "guild");
		replyEmbed.setTitle("command.log.settingsChangedTitle")
			.setDescription(
				this.resolveLang(
					`command.log.channel.${type}.${targetChannel?.type === "text" ? "set" : "reset"}`,
					{
						channelName: targetChannel?.name
					}
				)
			);
		return replyEmbed;
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
		}
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
	 * @type {{logs_left_event: string, logs_rename_event: string, logs_kick_event: string, logs_ban_event: string,
	 *     logs_msgimage_event: string, logs_join_event: string, logs_msgdelete_event: string, logs_msgupdate_event:
	 *     string}}
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
}

module.exports = LogSettingsCommand;
