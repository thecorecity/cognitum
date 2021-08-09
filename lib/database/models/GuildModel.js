const BaseModel = require("../../classes/base/BaseModel");
const Config = require("../../classes/ConfigManager");
const Sequelize = require("sequelize");

class GuildModel extends BaseModel {
	/**
	 * ID of the guild.
	 * @type {string|BigInt}
	 */
	id;

	/**
	 * Custom prefix for the guild.
	 * @type {string}
	 */
	prefix;

	/**
	 * Level of the access.
	 * @type {number}
	 */
	access;

	/**
	 * Documents mode.
	 * @type {number}
	 */
	doc_mode;

	/**
	 * Status of the nickname sanitizer module.
	 * @type {0|1}
	 */
	nickname_mode;

	/**
	 * Type of the nicknames sanitizer.
	 * @type {string}
	 */
	nickname_type;

	/**
	 * Status of the welcoming feature.
	 * @type {0|1}
	 */
	welcome_mode;

	/**
	 * Welcome channel ID.
	 * @type {string|BigInt}
	 */
	welcome_channel;

	/**
	 * Manager role.
	 * @type {string|BigInt}
	 */
	welcome_manager_role;

	/**
	 * Role of the verified member.
	 * @type {string|BigInt}
	 */
	welcome_verified_role;

	/**
	 * Welcome message content.
	 * @type {string}
	 */
	welcome_message;

	/**
	 * Status of the logs feature.
	 * @type {0|1}
	 */
	logs_enabled;

	/**
	 * Private logs channel.
	 * @type {string|BigInt}
	 */
	logs_private_channel;

	/**
	 * Public logs channel.
	 * @type {string|BigInt}
	 */
	logs_public_channel;

	/**
	 * Logging join event status.
	 * @type {0|1}
	 */
	logs_join_event;

	/**
	 * Logging leaving event status.
	 * @type {0|1}
	 */
	logs_left_event;

	/**
	 * Logging of the rename events.
	 * @type {0|1}
	 */
	logs_rename_event;

	/**
	 * Logging of the kick events.
	 * @type {0|1}
	 */
	logs_kick_event;

	/**
	 * Logging of the ban events.
	 * @type {0|1}
	 */
	logs_ban_event;

	/**
	 * Logging of the message deletion event.
	 * @type {0|1}
	 */
	logs_msgdelete_event;

	/**
	 * Logging of the image attachment sent.
	 * @type {0|1}
	 */
	logs_msgimage_event;

	/**
	 * Logging of the message updating event.
	 * @type {0|1}
	 */
	logs_msgupdate_event;

	/**
	 * Code of the selected language pack.
	 * @type {0|1}
	 */
	language;

	static attributes = {
		id: {
			type: Sequelize.BIGINT.UNSIGNED,
			primaryKey: true,
			allowNull: false
		},
		prefix: {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: true
		},
		access: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
			allowNull: false
		},
		doc_mode: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
			allowNull: false
		},
		nickname_mode: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
			allowNull: false
		},
		nickname_type: {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			defaultValue: "latin"
		},
		welcome_mode: {
			type: Sequelize.TINYINT,
			defaultValue: 0,
			allowNull: false
		},
		welcome_channel: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		welcome_manager_role: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		welcome_verified_role: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		welcome_message: {
			type: Sequelize.TEXT,
			allowNull: true
		},
		logs_enabled: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_private_channel: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		logs_public_channel: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		logs_join_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_left_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_rename_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_kick_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_ban_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_msgdelete_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_msgimage_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		logs_msgupdate_event: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		language: {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			defaultValue: "en"
		}
	};

	static options = {
		timestamps: false,
		tableName: "guild"
	};

	/**
	 * Resolving Guild instance and returns prefix if set.
	 * @param {string} guildId Discord Guild ID.
	 * @return {Promise<{guildInstance: GuildModel, prefix: string}>} GuildModel instance and prefix resolved using
	 *     ConfigManager class.
	 */
	static async resolvePrefix(guildId) {
		let prefix = Config.get("preferences.cognitum.prefix");
		const guild = await GuildModel.findOrCreate({
			where: {
				id: guildId
			}
		});
		if (guild[0].get("prefix") !== null)
			prefix = guild[0].get("prefix");
		return {
			prefix,
			guildInstance: guild[0]
		};
	}
}

module.exports = GuildModel;
