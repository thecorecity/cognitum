import BaseModel from "../../classes/base/BaseModel";
import GuildModel from "./GuildModel";
import Sequelize from "sequelize";

export default class GuildChannelModel extends BaseModel {
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
		},
		message: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		}
	};

	static initOptions = {
		tableName: "channel",
		timestamps: false
	};
}
