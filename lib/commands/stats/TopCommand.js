const BaseCommand = require("../../classes/base/BaseCommand");
const StatisticsCategory = require("../../categories/StatisticsCategory");
const ArgumentError = require("../../classes/errors/ArgumentError");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const StatisticsManager = require("../../classes/statistics/StatisticsManager");
const OrderedList = require("../../classes/content/OrderedList");
const { formatTimeString } = require("../../classes/Utils");

class TopCommand extends BaseCommand {
	async run() {
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
		const list = new OrderedList();
		list.setStyler(OrderedList.STYLER_DOTTED);
		topChannels.forEach(statsElement => {
			list.push(`<#${statsElement["id_channel"].toString()}> [${statsElement.getDataValue("total_weight")}]`);
		});
		embed.setDescription(list.toString());
		return embed;
	}

	async #generateVoiceList() {
		const embed = this.#createBaseEmbed("voice", { guildName: this.message.guild.name });
		const topVoice = await new StatisticsManager(this.message).queryTopVoice();
		const list = new OrderedList();
		list.setStyler(OrderedList.STYLER_DOTTED);
		topVoice.forEach(statsElement => {
			list.push(`<@${statsElement.GuildMemberModel.getDataValue("id_user").toString()}> ${formatTimeString(statsElement.getDataValue("total_weight"))}`);
		});
		embed.setDescription(list.toString());
		return embed;
	}

	async #generateMembersList() {
		const embed = this.#createBaseEmbed("members", { guildName: this.message.guild.name });
		const topMembers = await new StatisticsManager(this.message).queryTopMembers();
		const list = new OrderedList();
		list.setStyler(OrderedList.STYLER_DOTTED);
		topMembers.forEach(statsElement => {
			list.push(`<@${statsElement.GuildMemberModel.getDataValue("id_user").toString()}> [${statsElement.getDataValue("total_weight")}]`);
		});
		embed.setDescription(list.toString());
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

	static code = "top";
	static category = StatisticsCategory.getCode();
	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			min: 1,
			max: 1,
			values: [/^(ch(annel)?|v(oice)?|u(sers)?|<#\d+>)$/]
		}
	};
}

module.exports = TopCommand;
