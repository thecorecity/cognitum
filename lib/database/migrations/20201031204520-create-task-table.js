"use strict";

module.exports = {
	/**
	 * Creating tasks table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("task", {
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
		});
	},
	/**
	 * Simply dropping tasks table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.dropTable("task");
	}
};
