"use strict";

module.exports = {
	/**
	 * Creating members table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		/**
		 * Creating table for members.
		 */
		await queryInterface.createTable("member", {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
				comment: "Internal member ID"
			},
			id_guild: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: false,
				comment: "Related Discord guild ID"
			},
			id_user: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: false,
				comment: "Related Discord user ID"
			},
			access: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Local member access level"
			}
		});
		/**
		 * Setting up foreign keys for relationships between:
		 * - member.id_guild and guild.id
		 * - member.id_user and user.id
		 */
		await queryInterface.addConstraint("member", {
			fields: ["id_guild"],
			type: "foreign key",
			name: "fk_guild_member_related_to_guild",
			references: {
				table: "guild",
				field: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
		await queryInterface.addConstraint("member", {
			fields: ["id_user"],
			type: "foreign key",
			name: "fk_guild_member_related_to_user",
			references: {
				table: "user",
				field: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	/**
	 * Simply dropping members table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("member", "fk_guild_member_related_to_guild");
		await queryInterface.removeConstraint("member", "fk_guild_member_related_to_user");
		await queryInterface.dropTable("member");
	}
};
