"use strict";

module.exports = {
	/**
	 * Creating guild channels table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		/**
		 * Creating table.
		 */
		await queryInterface.createTable("channel", {
			id: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				comment: "Guild channel ID"
			},
			id_guild: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: false,
				comment: "Related guild ID"
			},
			hidden: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Channel hiding flag for statistics"
			}
		});
		/**
		 * Foreign key between channel.id_guild and guild.id.
		 */
		await queryInterface.addConstraint("channel", {
			fields: ["id_guild"],
			type: "foreign key",
			name: "fk_guild_channel_related_to_guild",
			references: {
				table: "guild",
				field: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	/**
	 * Simply dropping channel table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("channel", "fk_guild_channel_related_to_guild");
		await queryInterface.dropTable("channel");
	}
};
