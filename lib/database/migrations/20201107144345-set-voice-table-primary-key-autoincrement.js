"use strict";

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn("voice", "id", {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			comment: "Internal voice statistics record ID",
			autoIncrement: true
		});
	},
	/**
	 * Reverting this changes.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn("voice", "id", {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			comment: "Internal voice statistics record ID"
		});
	}
};
