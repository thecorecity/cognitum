"use strict";

module.exports = {
	/**
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize).} Sequelize
	 * @return {Promise<void>}
	 */
	async up(queryInterface, Sequelize) {
		// Adding column "stats_request_mode" to guild table.
		await queryInterface.addColumn("guild", "stats_request_mode", {
			type: Sequelize.TINYINT.UNSIGNED,
			allowNull: true,
			comment: "Statistics request mode for current guild."
		});
	},
	/**
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize).} Sequelize
	 * @return {Promise<void>}
	 */
	async down(queryInterface, Sequelize) {
		// Removing column "stats_request_mode" from guild table.
		await queryInterface.removeColumn("guild", "stats_request_mode");
	}
};
