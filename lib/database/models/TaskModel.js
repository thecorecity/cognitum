const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class TaskModel extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
			allowNull: false,
			comment: "Internal task ID"
		},
		code: {
			type: Sequelize.STRING,
			allowNull: false,
			comment: "Task code for TaskLoader"
		},
		time: {
			type: Sequelize.DATE,
			allowNull: false,
			comment: "Time for task to execute"
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

	static initOptions = {
		tableName: "task",
		timestamps: false
	};
}

module.exports = TaskModel;
