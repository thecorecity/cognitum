"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.addIndex("message", {
			name: "messages_by_channel",
			fields: [
				"id_channel"
			]
		});

		await queryInterface.addIndex("message", {
			name: "messages_by_member",
			fields: [
				"id_member"
			]
		});

		await queryInterface.addIndex("voice", {
			name: "voices_by_member",
			fields: [
				"id_member"
			]
		});
	},
	async down(queryInterface) {
		await queryInterface.removeIndex("message", "messages_by_channel");
		await queryInterface.removeIndex("message", "messages_by_member");
		await queryInterface.removeIndex("voice", "voices_by_member");
	}
};
