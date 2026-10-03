"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Adding column "stats_request_mode" to guild table.
		await queryInterface.addColumn("guild", "stats_request_mode", {
			type: Sequelize.TINYINT.UNSIGNED,
			allowNull: true,
			comment: "Statistics request mode for current guild."
		});
	},
	async down(queryInterface) {
		// Removing column "stats_request_mode" from guild table.
		await queryInterface.removeColumn("guild", "stats_request_mode");
	}
};
