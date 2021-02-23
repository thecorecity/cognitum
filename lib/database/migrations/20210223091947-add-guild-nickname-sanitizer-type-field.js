"use strict";

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		queryInterface.addColumn("guild", "nickname_type", {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			comment: "Selected nickname sanitizing type",
			defaultValue: "latin"
		});
	},
	/**
	 * Reverting this changes.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async queryInterface => {
		await queryInterface.removeColumn("guild", "nickname_type");
	}
};
