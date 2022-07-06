const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class UserModel extends BaseModel {
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

	static options = {
		tableName: "user",
		timestamps: false
	};
}

module.exports = UserModel;
