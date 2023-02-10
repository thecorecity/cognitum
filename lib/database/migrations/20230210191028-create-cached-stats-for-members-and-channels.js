"use strict";

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize).} Sequelize
	 * @return {Promise<void>}
	 */
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("member", "voice", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true,
			comment: "Cached amount of seconds spent in the voice channels"
		});

		await queryInterface.addColumn("member", "message", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true,
			comment: "Cached amount of message activity in the text channels"
		});

		await queryInterface.addColumn("channel", "message", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true,
			comment: "Cached amount of message activity of members"
		});

		await queryInterface.addColumn("guild", "cache_timestamp", {
			type: Sequelize.DATEONLY,
			allowNull: true,
			comment: "Date of the last caching action"
		});
	},
	/**
	 * Reverting this changes.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("member", "voice");
		await queryInterface.removeColumn("member", "message");
		await queryInterface.removeColumn("channel", "message");
		await queryInterface.removeColumn("guild", "cache_timestamp");
	}
};
