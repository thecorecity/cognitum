const BaseCommand = require("../../classes/base/BaseCommand");
const StatisticsCategory = require("../../categories/StatisticsCategory");
const ArgumentError = require("../../classes/errors/ArgumentError");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const StatisticsManager = require("../../classes/statistics/StatisticsManager");
const OrderedList = require("../../classes/content/OrderedList");
const { formatTimeString } = require("../../classes/Utils");

class TopCommand extends BaseCommand {
	#selectedPage;

	async run() {
		this.#selectedPage = 1;
		if (this.args.length === 2) {
			this.#selectedPage = isFinite(parseInt(this.args[1]))
				? parseInt(this.args[1])
				: 1;
		}
		if (["channels", "ch"].includes(this.args[0]))
			return await this.#generateChannelsList();
		if (["voice", "v"].includes(this.args[0]))
			return await this.#generateVoiceList();
		if (["users", "u"].includes(this.args[0]))
			return await this.#generateMembersList();
		if (this.message.mentions.channels.size && this.message.mentions.channels.first()?.type === "text")
			return await this.#generateMembersListForChannel(this.message.mentions.channels.first());
		throw new ArgumentError("value", {
			argumentPassed: this.args[0]
		});
	}

	async #generateChannelsList() {
		const embed = this.#createBaseEmbed("channels", { guildName: this.message.guild.name });
		const topChannels = await new StatisticsManager(this.message).queryTopChannels();
		const { start, end } = this.#calculatePageOffsets(topChannels);
		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);
		for (let i = start; i < end; i++) {
			let statsElement = topChannels[i];
			list.push(`<#${statsElement["id_channel"].toString()}> [${statsElement.getDataValue("total_weight")}]`);
		}
		embed.setDescription(
			list.length
				? list.toString()
				: this.resolveLang("command.top.statsEmpty.channels")
		);
		return embed;
	}

	async #generateVoiceList() {
		const embed = this.#createBaseEmbed("voice", { guildName: this.message.guild.name });
		const topVoice = await new StatisticsManager(this.message).queryTopVoice();
		const { start, end } = this.#calculatePageOffsets(topVoice);
		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);
		for (let i = start; i < end; i++) {
			let statsElement = topVoice[i];
			list.push(`<@${statsElement.GuildMemberModel.getDataValue("id_user").toString()}> ${formatTimeString(statsElement.getDataValue("total_weight"))}`);
		}
		embed.setDescription(
			list.length
				? list.toString()
				: this.resolveLang("command.top.statsEmpty.voice")
		);
		return embed;
	}

	async #generateMembersList() {
		const embed = this.#createBaseEmbed("members", { guildName: this.message.guild.name });
		const topMembers = await new StatisticsManager(this.message).queryTopMembers();
		const { start, end } = this.#calculatePageOffsets(topMembers);
		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);
		for (let i = start; i < end; i++) {
			let statsElement = topMembers[i];
			list.push(`<@${statsElement.GuildMemberModel.getDataValue("id_user").toString()}> [${statsElement.getDataValue("total_weight")}]`);
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

	/**
	 *
	 * @param channel
	 * @return {Promise<void>}
	 */
	async #generateMembersListForChannel(channel) {

	}

	get #selectedOffsetStart() {
		return (this.#selectedPage - 1) * this.constructor.PAGE_SIZE;
	}

	get #selectedOffsetEnd() {
		return this.#selectedPage * this.constructor.PAGE_SIZE;
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
			values: [/^(ch(annel)?|v(oice)?|u(sers)?|<#\d+>)$/, /^\d+$/]
		}
	};
	static usage = "top <list_type> [<page>]";
	static examples = [
		"example.channels",
		"example.voiceShort",
		"example.usersPaged"
	];

	static PAGE_SIZE = 10;
}

module.exports = TopCommand;
