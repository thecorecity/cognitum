"use strict";

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("user", "trackable", {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 1,
			comment: "Is user trackable?"
		});
	},
	/**
	 * Reverting this changes.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	async down(queryInterface) {
		await queryInterface.removeColumn("user", "trackable");
	}
};
