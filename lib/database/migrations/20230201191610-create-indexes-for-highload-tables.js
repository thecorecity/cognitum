"use strict";

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex("message", {
			name: "messages_by_channel",
			fields: [
				"id_channel"
			]
		});

		await queryInterface.addIndex("message", {
			name: "messages_by_member",
			fields: [
				"id_member"
			]
		});

		await queryInterface.addIndex("voice", {
			name: "voices_by_member",
			fields: [
				"id_member"
			]
		});
	},
	/**
	 * Reverting this changes.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex("message", "messages_by_channel");
		await queryInterface.removeIndex("message", "messages_by_member");
		await queryInterface.removeIndex("voice", "voices_by_member");
	}
};
