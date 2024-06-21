"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("guild", "nickname_type", {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			comment: "Selected nickname sanitizing type",
			defaultValue: "latin"
		});
	},
	down: async queryInterface => {
		await queryInterface.removeColumn("guild", "nickname_type");
	}
};
