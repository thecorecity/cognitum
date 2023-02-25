'use strict';

module.exports = {
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize).} Sequelize
	 * @return {Promise<void>}
	 */
	async up(queryInterface, Sequelize) {
		await queryInterface.sequelize.query(`
        alter table message
            modify timestamp timestamp
                default current_timestamp()
                not null
                comment 'Message sent timestamp';
		`);

		await queryInterface.sequelize.query(`
        alter table voice
            modify timestamp_begin timestamp
                default current_timestamp()
                not null
                comment 'Voice record started timestamp';
		`);
	},
	/**
	 * Updating primary key for voice table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize).} Sequelize
	 * @return {Promise<void>}
	 */
	async down(queryInterface, Sequelize) {
		await queryInterface.sequelize.query(`
        alter table message
            modify timestamp timestamp
                default current_timestamp()
                not null
                on update current_timestamp()
                comment 'Message sent timestamp';
		`);

		await queryInterface.sequelize.query(`
        alter table voice
            modify timestamp_begin timestamp
                default current_timestamp()
                not null
                on update current_timestamp()
                comment 'Voice record started timestamp';
		`);
	}
};
