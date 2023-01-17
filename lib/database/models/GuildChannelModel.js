const BaseModel = require("../../classes/base/BaseModel");
const GuildModel = require("./GuildModel");
const Sequelize = require("sequelize");

class GuildChannelModel extends BaseModel {
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
				model: GuildModel,
				key: "id"
			}
		},
		hidden: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	};

	static initOptions = {
		tableName: "channel",
		timestamps: false
	};
}

module.exports = GuildChannelModel;
