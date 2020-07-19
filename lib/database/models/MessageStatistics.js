const GuildMember = require("./GuildMember.js");
const BaseModel = require("./BaseModel.js");
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
		timestamp: {
			type: "TIMESTAMP",
			allowNull: false,
			defaultValue: Sequelize.NOW
		},
		weight: {
			type: Sequelize.SMALLINT.UNSIGNED,
			allowNull: false
		}
	};

	static options = {
		tableName: "message",
		timestamps: false
	};
}

module.exports = MessageStatistics;
