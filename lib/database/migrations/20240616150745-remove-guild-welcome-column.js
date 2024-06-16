"use strict";

module.exports = {
	/**
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	async up(queryInterface) {
		await queryInterface.removeColumn("guild", "welcome_mode");
		await queryInterface.removeColumn("guild", "welcome_channel");
		await queryInterface.removeColumn("guild", "welcome_manager_role");
		await queryInterface.removeColumn("guild", "welcome_verified_role");
		await queryInterface.removeColumn("guild", "welcome_message");
	},
	/**
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import('sequelize').} Sequelize
	 * @return {Promise<void>}
	 */
	async down(queryInterface, Sequelize) {
		await queryInterface.addColumn("guild", "welcome_mode", {
			type: Sequelize.TINYINT,
			defaultValue: 0,
			allowNull: false,
			comment: "Welcome feature for current guild"
		});

		await queryInterface.addColumn("guild", "welcome_channel", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true,
			comment: "Welcome channel ID for welcome message sending and managers approving"
		});

		await queryInterface.addColumn("guild", "welcome_manager_role", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true,
			comment: "Welcome manager role ID for welcome feature"
		});

		await queryInterface.addColumn("guild", "welcome_verified_role", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true,
			comment: "Approved member role ID"
		});

		await queryInterface.addColumn("guild", "welcome_message", {
			type: Sequelize.TEXT,
			allowNull: true,
			comment: "Welcome message content for every member join"
		});
	}
};
