const BaseModel = require("../../classes/base/BaseModel.js");
const Sequelize = require("sequelize");

class Task extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.UUIDV4,
			primaryKey: true,
			allowNull: false,
			comment: "Internal task ID"
		},
		code: {
			type: Sequelize.STRING,
			allowNull: false,
			comment: "Task code for TaskLoader"
		},
		payload: {
			type: Sequelize.JSON,
			allowNull: false,
			comment: "Payload for TaskLoader"
		},
		completed: {
			type: Sequelize.TINYINT.UNSIGNED,
			defaultValue: 0,
			allowNull: false,
			comment: "Task completed flag"
		}
	};

	static options = {
		tableName: "task",
		timestamps: false
	};
}

module.exports = Task;
