"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("task", {
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
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable("task");
	}
};
