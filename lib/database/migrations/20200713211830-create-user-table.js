"use strict";

module.exports = {
	/**
	 * Creating users table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("user", {
			id: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: false,
				primaryKey: true,
				comment: "User Discord ID"
			},
			access: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Global bot access level"
			}
		});
	},
	/**
	 * Simply dropping user table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.dropTable("user");
	}
};
