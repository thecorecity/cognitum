"use strict";

module.exports = {
	/**
	 * Adding new field to table.
	 * Be careful! This migration will clear all message statistics data!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		// New column requires relationship with one of the channels, but there is no information about channels
		// available, so we can't use old data after this migration. Deleting all available data.
		await queryInterface.bulkDelete("message", {});
		await queryInterface.addColumn("message", "id_channel", {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			comment: "Related channel ID"
		});
		await queryInterface.addConstraint("message", {
			fields: ["id_channel"],
			type: "foreign key",
			name: "fk_message_related_to_guild_channel",
			references: {
				table: "channel",
				field: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	/**
	 * Reverting this added field. All data will be saved.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("message", "fk_message_related_to_guild_channel");
		await queryInterface.removeColumn("message", "id_channel");
	}
};
