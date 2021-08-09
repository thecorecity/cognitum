const GuildMember = require("./GuildMemberModel");
const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class VoiceStatisticsModel extends BaseModel {
	/**
	 * ID of the voice statistics entry.
	 * @type {number}
	 */
	id;

	/**
	 * ID of the member.
	 * @type {number}
	 */
	id_member;

	/**
	 * Time of the voice entry start.
	 * @type {Date}
	 */
	timestamp_begin;

	/**
	 * Amount of time this voice activity happened.
	 * @type {number}
	 */
	weight;

	static attributes = {
		id: {
			type: Sequelize.INTEGER.UNSIGNED,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		id_member: {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			references: {
				model: GuildMember,
				key: "id"
			}
		},
		timestamp_begin: {
			type: "TIMESTAMP",
			allowNull: false
		},
		weight: {
			type: Sequelize.TIME,
			allowNull: false
		}
	};

	static options = {
		tableName: "voice",
		timestamps: false
	};
}

module.exports = VoiceStatisticsModel;
