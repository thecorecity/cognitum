const GuildMemberModel = require("./GuildMemberModel");
const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class VoiceStatisticsModel extends BaseModel {
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
				model: GuildMemberModel,
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
		timestamps: false,
		associate() {
			VoiceStatisticsModel.belongsTo(GuildMemberModel, {foreignKey: "id_member"});
		}
	};
}

module.exports = VoiceStatisticsModel;
