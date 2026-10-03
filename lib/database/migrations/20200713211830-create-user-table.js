"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("user", {
			id: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				comment: "User Discord ID"
			},
			access: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Global bot access level"
			}
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable("user");
	}
};
