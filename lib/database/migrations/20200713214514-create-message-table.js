"use strict";

module.exports = {
	/**
	 * Creating messages statistics table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
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
				type: Sequelize.SMALLINT.UNSIGNED,
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
				fields: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	/**
	 * Simply dropping messages statistics table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("message", "fk_message_related_to_guild_member");
		await queryInterface.dropTable("message");
	}
};
