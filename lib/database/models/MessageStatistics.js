const GuildMember = require("./GuildMember.js");
const GuildChannel = require("./GuildChannel.js");
const BaseModel = require("../../classes/base/BaseModel.js");
const Sequelize = require("sequelize");

class MessageStatistics extends BaseModel {
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
				model: GuildMember,
				key: "id"
			}
		},
		id_channel: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: GuildChannel,
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

module.exports = MessageStatistics;
