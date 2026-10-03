"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
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
	async down(queryInterface) {
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
