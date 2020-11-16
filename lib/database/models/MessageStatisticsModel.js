const GuildMemberModel = require("./GuildMemberModel");
const GuildChannelModel = require("./GuildChannelModel");
const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class MessageStatisticsModel extends BaseModel {
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
