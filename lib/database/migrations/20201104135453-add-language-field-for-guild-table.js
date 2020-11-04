"use strict";

module.exports = {
	/**
	 * Adding new field to table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("guild", "language", {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			defaultValue: "en",
			comment: "Selected language for bot appearance"
		});
	},
	/**
	 * Reverting this added field. All data will be saved.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeColumn("guild", "language");
	}
};
