"use strict";

module.exports = {
	/**
	 * Creating voice statistics table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		/**
		 * Creating message table.
		 */
		await queryInterface.createTable("voice", {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				primaryKey: true,
				allowNull: false,
				comment: "Internal voice statistics record ID"
			},
			id_member: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				comment: "Related member ID"
			},
			timestamp_begin: {
				type: "TIMESTAMP",
				allowNull: false,
				comment: "Voice record started timestamp"
			},
			weight: {
				type: Sequelize.TIME,
				allowNull: false,
				comment: "Amount of time for this voice record"
			}
		});
		/**
		 * Creating foreign key between message.id_member and member.id.
		 */
		await queryInterface.addConstraint("voice", {
			fields: ["id_member"],
			type: "foreign key",
			name: "fk_voice_related_to_guild_member",
			references: {
				table: "member",
				fields: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	/**
	 * Simply dropping voice statistics table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("voice", "fk_voice_related_to_guild_member");
		await queryInterface.dropTable("voice");
	}
};
