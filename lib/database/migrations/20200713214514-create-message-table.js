"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		/**
		 * Creating message table.
		 */
		await queryInterface.createTable("message", {
			id: {
				type: Sequelize.BIGINT.UNSIGNED,
				primaryKey: true,
				allowNull: false,
				comment: "Message Discord ID"
			},
			id_member: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				comment: "Related member ID"
			},
			timestamp: {
				type: "TIMESTAMP",
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "Message sent timestamp"
			},
			weight: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				comment: "Amount of score get by this message"
			}
		});
		/**
		 * Creating foreign key between message.id_member and member.id.
		 */
		await queryInterface.addConstraint("message", {
			fields: ["id_member"],
			type: "foreign key",
			name: "fk_message_related_to_guild_member",
			references: {
				table: "member",
				field: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("message", "fk_message_related_to_guild_member");
		await queryInterface.dropTable("message");
	}
};
