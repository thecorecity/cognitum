import BaseModel from "../../classes/base/BaseModel";
import Sequelize from "sequelize";

export default class UserModel extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			primaryKey: true
		},
		access: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		trackable: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 1
		}
	};

	static initOptions = {
		tableName: "user",
		timestamps: false
	};
}
