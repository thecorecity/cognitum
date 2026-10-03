"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("guild", {
			id: {
				type: Sequelize.BIGINT.UNSIGNED,
				primaryKey: true,
				allowNull: false,
				comment: "Guild Discord Snowflake"
			},
			prefix: {
				type: Sequelize.TEXT({
					length: "tiny"
				}),
				allowNull: true,
				comment: "Custom selected prefix"
			},
			access: {
				type: Sequelize.TINYINT,
				defaultValue: 0,
				allowNull: false,
				comment: "Bot access related to this guild"
			},
			doc_mode: {
				type: Sequelize.TINYINT,
				defaultValue: 0,
				allowNull: false,
				comment: "Documents mode related to this guild"
			},
			nickname_mode: {
				type: Sequelize.TINYINT,
				defaultValue: 0,
				allowNull: false,
				comment: "Nickname sanitizing for current guild"
			},
			welcome_mode: {
				type: Sequelize.TINYINT,
				defaultValue: 0,
				allowNull: false,
				comment: "Welcome feature for current guild",
			},
			welcome_channel: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
				comment: "Welcome channel ID for welcome message sending and managers approving"
			},
			welcome_manager_role: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
				comment: "Welcome manager role ID for welcome feature"
			},
			welcome_verified_role: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
				comment: "Approved member role ID"
			},
			welcome_message: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "Welcome message content for every member join"
			},
			logs_enabled: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Logging feature for current guild"
			},
			logs_private_channel: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
				comment: "Private logs channel ID"
			},
			logs_public_channel: {
				type: Sequelize.BIGINT.UNSIGNED,
				allowNull: true,
				comment: "Public logs channel ID"
			},
			logs_join_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "New members join event logging"
			},
			logs_left_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Members left event logging"
			},
			logs_rename_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Members nickname changes event logging"
			},
			logs_kick_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Members kick by admins event logging"
			},
			logs_ban_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Members ban by admins event logging"
			},
			logs_msgdelete_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Message deleting event logging"
			},
			logs_msgimage_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Message attachments sent logging"
			},
			logs_msgupdate_event: {
				type: Sequelize.TINYINT,
				allowNull: false,
				defaultValue: 0,
				comment: "Message updating event logging"
			}
		});
	},
	down: async (queryInterface) => {
		await queryInterface.dropTable("guild");
	}
};
