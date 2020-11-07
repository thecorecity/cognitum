const GuildMember = require("./GuildMember.js");
const BaseModel = require("../../classes/base/BaseModel.js");
const Sequelize = require("sequelize");

class VoiceStatistics extends BaseModel {
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
	}
}

module.exports = VoiceStatistics;
