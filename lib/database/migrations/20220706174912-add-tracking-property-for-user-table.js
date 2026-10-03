"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("user", "trackable", {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 1,
			comment: "Is user trackable?"
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn("user", "trackable");
	}
};
