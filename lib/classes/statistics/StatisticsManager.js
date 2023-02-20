const sequelize = require("sequelize");
const { VoiceStatisticsModel, GuildChannelModel, MessageStatisticsModel, GuildMemberModel } = require("../Database");
const { Op } = require("sequelize");

class StatisticsManager {
	/**
	 * @type {import("discord.js").Message}
	 */
	#message;

	/**
	 * @param {import("discord.js").Message} message Target message.
	 */
	constructor(message) {
		this.#message = message;
	}

	/**
	 * Query top channels activity for current guild.
	 * @param {StatisticsManagerQueryOptions} [options] List of options.
	 * @return {Promise<MessageStatisticsModel[]>}
	 */
	async queryTopChannels(options = {}) {
		return StatisticsManager.queryTopChannelsForGuild(this.#message.guild.id, options);
	}

	/**
	 * Query top members of current guild.
	 * @param {StatisticsManagerQueryOptions} [options] List of options.
	 * @return {Promise<MessageStatisticsModel[]>}
	 */
	async queryTopMembers(options = {}) {
		return StatisticsManager.queryTopMembersForGuild(this.#message.guild.id, options);
	}

	/**
	 * Query top voice activity for current guild.
	 * @param {StatisticsManagerQueryOptions} [options] List of options.
	 * @return {Promise<VoiceStatisticsModel[]>}
	 */
	async queryTopVoice(options= {}) {
		return StatisticsManager.queryTopVoiceForGuild(this.#message.guild.id, options);
	}

	/**
	 * @param {string|BigInt} guildId Id to calculate top channels for.
	 * @param {StatisticsManagerQueryOptions} [options]
	 * @return {Promise<MessageStatisticsModel[]>}
	 */
	static async queryTopChannelsForGuild(guildId, options = {}) {
		return MessageStatisticsModel.findAll({
			where: {
				timestamp: this.#generateTimestampConditionFromOptions(options)
			},
			attributes: [
				"id_channel",
				[sequelize.fn("SUM", sequelize.col("weight")), "total_weight"]
			],
			include: [
				{
					model: GuildMemberModel,
					attributes: ["id", "id_user"],
					where: {
						id_guild: guildId
					}
				},
				{
					model: GuildChannelModel,
					where: {
						hidden: 0
					}
				}
			],
			group: "id_channel",
			order: [
				[sequelize.fn("SUM", sequelize.col("weight")), "DESC"]
			]
		});
	}

	/**
	 * @param {string|BigInt} guildId Id of the guild.
	 * @param {StatisticsManagerQueryOptions} [options] Options for query.
	 * @return {Promise<MessageStatisticsModel[]>}
	 */
	static async queryTopMembersForGuild(guildId, options) {
		return MessageStatisticsModel.findAll({
			where: {
				timestamp: this.#generateTimestampConditionFromOptions(options)
			},
			attributes: [
				"id_member",
				[sequelize.fn("SUM", sequelize.col("weight")), "total_weight"]
			],
			include: [
				{
					model: GuildMemberModel,
					attributes: [
						"id_user"
					],
					where: {
						id_guild: guildId
					}
				}
			],
			group: "id_member",
			order: [
				[sequelize.fn("SUM", sequelize.col("weight")), "DESC"]
			]
		});
	}

	/**
	 * @param {string|BigInt} guildId Id of the guild.
	 * @param {StatisticsManagerQueryOptions} [options] Options for query.
	 * @return {Promise<VoiceStatisticsModel[]>}
	 */
	static async queryTopVoiceForGuild(guildId, options) {
		return VoiceStatisticsModel.findAll({
			where: {
				timestamp_begin: this.#generateTimestampConditionFromOptions(options)
			},
			attributes: [
				"id_member",
				[sequelize.fn("SUM", sequelize.col("weight")), "total_weight"]
			],
			include: [
				{
					model: GuildMemberModel,
					attributes: [
						"id_user"
					],
					where: {
						id_guild: guildId
					}
				}
			],
			group: "id_member",
			order: [
				[sequelize.fn("SUM", sequelize.col("weight")), "DESC"]
			]
		});
	}

	/**
	 * Generate the condition for the timestamp field depending on the options provided.
	 * @param {StatisticsManagerQueryOptions} options Options passed into the method.
	 * @return {Object} Condition with dates if they were provided on method call.
	 */
	static #generateTimestampConditionFromOptions(options) {
		return Object.assign(
			{},
			options.dateStart instanceof Date ? { [Op.gt]: options.dateStart } : {},
			options.dateEnd instanceof Date ? { [Op.lte]: options.dateEnd } : {}
		);
	}
}

/**
 * @typedef {Object} StatisticsManagerQueryOptions
 * @property {Date|null} [dateStart] Interval starting date.
 * @property {Date|null} [dateEnd] Interval ending date.
 */

module.exports = StatisticsManager;
