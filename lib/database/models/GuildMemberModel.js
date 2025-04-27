import BaseModel from "../../classes/base/BaseModel";
import GuildModel from "./GuildModel";
import UserModel from "./UserModel";
import Sequelize from "sequelize";

export default class GuildMemberModel extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		id_guild: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: GuildModel,
				key: "id"
			}
		},
		id_user: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: UserModel,
				key: "id"
			}
		},
		access: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		message: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		voice: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		}
	};

	static initOptions = {
		tableName: "member",
		timestamps: false
	};
}
