const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");

class TaskModel extends BaseModel {
	/**
	 * UUID string of the task.
	 * @type {string}
	 */
	id;

	/**
	 * Code of the task.
	 * @type {string}
	 */
	code;

	/**
	 * Time of the task.
	 * @type {Date}
	 */
	time;

	/**
	 * Payload for this task.
	 * @type {string}
	 */
	payload;

	/**
	 * Flag for the status of completion for this task.
	 * @type {0|1}
	 */
	completed;

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

	static options = {
		tableName: "task",
		timestamps: false
	};
}

module.exports = TaskModel;
