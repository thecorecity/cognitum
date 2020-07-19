const BaseModel = require("./BaseModel.js");
const Guild = require("./Guild.js");
const Sequelize = require("sequelize");

class GuildChannel extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			primaryKey: true,
		},
		id_guild: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: Guild,
				key: "id"
			}
		},
		hidden: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	};

	static options = {
		tableName: "channel",
		timestamps: false
	};
}

module.exports = GuildChannel;
