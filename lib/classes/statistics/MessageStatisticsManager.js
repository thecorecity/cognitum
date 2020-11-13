const sequelize = require("sequelize");
const { MessageStatisticsModel, GuildMemberModel } = require("../Database");

class MessageStatisticsManager {
	/**
	 * @type {module:"discord.js".Message}
	 */
	#message;

	/**
	 *
	 * @param {module:"discord.js".Message} message Target message.
	 */
	constructor(message) {
		this.#message = message;
	}

	async queryTopChannels() {
		return MessageStatisticsModel.findAll({
			attributes: [
				"id_channel",
				[sequelize.fn("COUNT", sequelize.col("weight")), "total_weight"]
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
				[sequelize.fn("COUNT", sequelize.col("weight")), "DESC"]
			]
		});
	}

	async queryTopMembers() {
		return MessageStatisticsModel.findAll({
			attributes: [
				"id_member",
				[sequelize.fn("COUNT", sequelize.col("weight")), "total_weight"]
			],
			include: [
				{
					model: GuildMemberModel,
					attributes: [
						["id", "member_id"]
					]
				}
			],
			group: "id_member"
		});
	}
}

module.exports = MessageStatisticsManager;
