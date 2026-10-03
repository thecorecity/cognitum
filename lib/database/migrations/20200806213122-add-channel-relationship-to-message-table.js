"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
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
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("message", "fk_message_related_to_guild_channel");
		await queryInterface.removeColumn("message", "id_channel");
	}
};
