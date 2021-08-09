const GuildMemberModel = require("./GuildMemberModel");
const GuildChannelModel = require("./GuildChannelModel");
const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class MessageStatisticsModel extends BaseModel {
	/**
	 * ID of the message.
	 * @type {string|BigInt}
	 */
	id;

	/**
	 * ID of the member.
	 * @type {number}
	 */
	id_member;

	/**
	 * ID of the channel.
	 * @type {string|BigInt}
	 */
	id_channel;

	/**
	 * Time of the message sent.
	 * @type {Date}
	 */
	timestamp;

	/**
	 * Weight of the message.
	 * @type {number}
	 */
	weight;

	static attributes = {
		id: {
			type: Sequelize.BIGINT.UNSIGNED,
			primaryKey: true,
			allowNull: false
		},
		id_member: {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			references: {
				model: GuildMemberModel,
				key: "id"
			}
		},
		id_channel: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: GuildChannelModel,
				key: "id"
			}
		},
		timestamp: {
			type: "TIMESTAMP",
			allowNull: false,
			defaultValue: Sequelize.NOW
		},
		weight: {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false
		}
	};

	static options = {
		tableName: "message",
		timestamps: false
	};
}

module.exports = MessageStatisticsModel;
