"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn("voice", "id", {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			comment: "Internal voice statistics record ID",
			autoIncrement: true
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn("voice", "id", {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			comment: "Internal voice statistics record ID"
		});
	}
};
