const sequelize = require("sequelize");
const { VoiceStatisticsModel } = require("../Database");
const { MessageStatisticsModel, GuildMemberModel } = require("../Database");

class StatisticsManager {
	/**
	 * @type {module:"discord.js".Message}
	 */
	#message;

	/**
	 * @param {module:"discord.js".Message} message Target message.
	 */
	constructor(message) {
		this.#message = message;
	}

	/**
	 * Query top channels activity for current guild.
	 * @return {Promise<MessageStatisticsModel[]>}
	 */
	async queryTopChannels() {
		return MessageStatisticsModel.findAll({
			attributes: [
				"id_channel",
				[sequelize.fn("SUM", sequelize.col("weight")), "total_weight"]
			],
			include: [
				{
					model: GuildMemberModel,
					attributes: ["id", "id_user"],
					where: {
						id_guild: this.#message.guild.id
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
	 * Query top members of current guild.
	 * @return {Promise<MessageStatisticsModel[]>}
	 */
	async queryTopMembers() {
		return MessageStatisticsModel.findAll({
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
						id_guild: this.#message.guild.id
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
	 * Query top voice activity for current guild.
	 * @return {Promise<VoiceStatisticsModel[]>}
	 */
	async queryTopVoice() {
		return VoiceStatisticsModel.findAll({
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
						id_guild: this.#message.guild.id
					}
				}
			],
			group: "id_member",
			order: [
				[sequelize.fn("SUM", sequelize.col("weight")), "DESC"]
			]
		});
	}
}

module.exports = StatisticsManager;
