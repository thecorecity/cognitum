"use strict";

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize).} Sequelize
	 * @return {Promise<void>}
	 */
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkUpdate(
			"guild",
			{
				cache_timestamp: null
			},
			// Yes, we need to remove all cached values
			{}
		);

		await queryInterface.bulkUpdate(
			"member",
			{
				message: null,
				voice: null
			},
			{}
		);

		await queryInterface.bulkUpdate(
			"channel",
			{
				message: null
			},
			{}
		);

		await queryInterface.addColumn("message", "cached", {
			type: Sequelize.TINYINT.UNSIGNED,
			allowNull: true,
			comment: "Is this entry already cached."
		});

		await queryInterface.addColumn("voice", "cached", {
			type: Sequelize.TINYINT.UNSIGNED,
			allowNull: true,
			comment: "Is this entry already cached."
		});
	},
	/**
	 * Reverting this changes.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	async down(queryInterface, Sequelize) {
		await queryInterface.bulkUpdate(
			"guild",
			{
				cache_timestamp: null
			},
			// Yes, we need to remove all cached values
			{}
		);

		await queryInterface.bulkUpdate(
			"member",
			{
				message: null,
				voice: null
			},
			{}
		);

		await queryInterface.bulkUpdate(
			"channel",
			{
				message: null
			},
			{}
		);

		await queryInterface.removeColumn("message", "cached");
		await queryInterface.removeColumn("voice", "cached");
	}
};
