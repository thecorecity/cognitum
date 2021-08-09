const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class UserModel extends BaseModel {
	/**
	 * ID of the user.
	 * @type {string|BigInt}
	 */
	id;

	/**
	 * Level of the access.
	 * @type {number}
	 */
	access;

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
		}
	};

	static options = {
		tableName: "user",
		timestamps: false
	};
}

module.exports = UserModel;
