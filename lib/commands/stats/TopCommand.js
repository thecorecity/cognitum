const BaseCommand = require("../../classes/base/commands/BaseCommand");
const StatisticsCategory = require("../../categories/StatisticsCategory");
const ArgumentError = require("../../classes/errors/ArgumentError");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const StatisticsManager = require("../../classes/statistics/StatisticsManager");
const OrderedList = require("../../classes/content/OrderedList");
const { formatTimeString, createModuleLogger } = require("../../classes/Utils");
const { GuildChannelModel } = require("../../classes/Database");

const logger = createModuleLogger("topCommand");

class TopCommand extends BaseCommand {
	#selectedPage = 1;

	async run() {
		if (this.args.length === 2) {
			this.#selectedPage = isFinite(parseInt(this.args[1]))
				? parseInt(this.args[1])
				: 1;
		}

		if (["channel", "channels", "ch"].includes(this.args[0]))
			return await this.#generateChannelsList();

		if (["voice", "v"].includes(this.args[0]))
			return await this.#generateVoiceList();

		if (["user", "users", "u"].includes(this.args[0]))
			return await this.#generateMembersList();

		throw new ArgumentError("value", {
			argumentPassed: this.args[0]
		});
	}

	/**
	 * Send typing event to the current channel.
	 * @return {Promise<true>} Always return true.
	 */
	async #sendTypingEvent() {
		await this.context.channel.sendTyping();
		return true;
	}

	/**
	 * Generate and return the report about channels activity.
	 * @return {Promise<DefaultEmbed>} Embed for sending to current channel.
	 */
	async #generateChannelsList() {
		await this.#sendTypingEvent();

		const topChannels = await new StatisticsManager(this.message).queryTopChannels();
		const { start, end } = this.#calculatePageOffsets(topChannels);

		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);
		for (let i = start; i < end; i++) {
			let statsElement = topChannels[i];
			list.push(`<#${statsElement.id_channel}> [${statsElement.getDataValue("total_weight")}]`);
		}

		const areMissingChannelsFound = await this.#detectMissingChannels(topChannels);

		const embed = this.#createBaseEmbed("channels", { guildName: this.message.guild.name });
		embed.setDescription(
			list.length
				? list.toString()
				: this.resolveLang("command.top.statsEmpty.channels")
		);

		if (areMissingChannelsFound) {
			embed.setFooter({
				text: this.resolveLang("command.top.footer.hiddenChannels")
			});
		}

		return embed;
	}

	/**
	 * Check which channels should be hidden from the list.
	 * @param {MessageStatisticsModel[]} statisticsModels
	 * @returns {Promise<boolean>}
	 */
	async #detectMissingChannels(statisticsModels) {
		/** @type {Long[]} */
		const channelIdsToRemove = [];

		const guild = this.message.guild;

		for (const channelModel of statisticsModels) {
			const channelId = channelModel.id_channel;

			let channel = guild.channels.cache.get(channelId);

			try {
				if (!channel)
					channel = await guild.channels.fetch(channelId);
			} catch (ignored) {
				// Do nothing, channel will be treated as missing.
			}

			if (!channel)
				channelIdsToRemove.push(channelId);
		}

		if (channelIdsToRemove.length) {
			this
				.#hideChannels(channelIdsToRemove)
				.then(() => {
					logger.debug(`Hidden ${channelIdsToRemove.length} channels for ${guild.id}.`);
				});
		}

		return !!channelIdsToRemove.length;
	}

	/**
	 * @param {Long[]} channelIdsToRemove
	 * @returns {Promise<void>}
	 */
	async #hideChannels(channelIdsToRemove) {
		for (const channelId of channelIdsToRemove) {
			const channelModel = await GuildChannelModel.findOne({
				where: {
					id: channelId.toString(),
				}
			});

			if (!channelModel)
				continue;

			channelModel.hidden = 1;
			await channelModel.save();
		}
	}

	/**
	 * Generate and return the report about voice activity.
	 * @return {Promise<DefaultEmbed>} Embed for sending to current channel.
	 */
	async #generateVoiceList() {
		await this.#sendTypingEvent();

		const embed = this.#createBaseEmbed("voice", { guildName: this.message.guild.name });
		const topVoice = await new StatisticsManager(this.message).queryTopVoice();
		const { start, end } = this.#calculatePageOffsets(topVoice);
		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);
		for (let i = start; i < end; i++) {
			let statsElement = topVoice[i];
			list.push(`<@${statsElement.GuildMemberModel.id_user}> ${formatTimeString(statsElement.getDataValue("total_weight"))}`);
		}
		embed.setDescription(
			list.length
				? list.toString()
				: this.resolveLang("command.top.statsEmpty.voice")
		);
		return embed;
	}

	/**
	 * Generate and return report with members activity.
	 * @return {Promise<DefaultEmbed>} Embed for sending to current channel.
	 */
	async #generateMembersList() {
		await this.#sendTypingEvent();

		const embed = this.#createBaseEmbed("members", { guildName: this.message.guild.name });
		const topMembers = await new StatisticsManager(this.message).queryTopMembers();
		const { start, end } = this.#calculatePageOffsets(topMembers);
		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);
		for (let i = start; i < end; i++) {
			let statsElement = topMembers[i];
			list.push(`<@${statsElement.GuildMemberModel.id_user}> [${statsElement.getDataValue("total_weight")}]`);
		}
		embed.setDescription(
			list.length
				? list.toString()
				: this.resolveLang("command.top.statsEmpty.members")
		);
		return embed;
	}

	/**
	 * Generate base embed for filling with list.
	 * @param {"channels"|"voice"|"members"|"channelMembers"} listType Type of list for selected embed.
	 * @param {Object<string, string>} fillOptions Options for replacement on embed title.
	 * @return {DefaultEmbed} Generated embed.
	 */
	#createBaseEmbed(listType, fillOptions) {
		const embed = new DefaultEmbed(this.context, "guild");
		embed.setTitle(
			this.resolveLang(`command.top.listTitle.${listType}`, fillOptions)
		);
		return embed;
	}

	get #selectedOffsetStart() {
		return (this.#selectedPage - 1) * TopCommand.#pageSize;
	}

	get #selectedOffsetEnd() {
		return this.#selectedPage * TopCommand.#pageSize;
	}

	/**
	 * Calculate page offsets based on result.
	 * @param {Array} array List of activities for calculating page offsets.
	 * @return {{start: number, end: number}}
	 */
	#calculatePageOffsets(array) {
		if (this.#selectedOffsetStart >= array.length)
			this.#selectedPage = 1;
		return {
			start: this.#selectedOffsetStart,
			end: Math.min(this.#selectedOffsetEnd, array.length)
		};
	}

	static code = "top";
	static category = StatisticsCategory.getCode();
	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			min: 1,
			max: 2,
			values: [/^(ch(annels?)?|v(oice)?|u(sers?)?)$/, /^\d+$/]
		}
	};
	static usage = "top <list_type> [<page>]";
	static examples = [
		"example.channels",
		"example.voiceShort",
		"example.usersPaged"
	];

	static #pageSize = 20;
}

module.exports = TopCommand;
