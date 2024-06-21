"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("guild", "language", {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			comment: "Selected language for bot appearance"
		});
	},
	down: async (queryInterface) => {
		await queryInterface.removeColumn("guild", "language");
	}
};
