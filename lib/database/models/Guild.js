const BaseModel = require("../../classes/base/BaseModel.js");
const Config = require("../../classes/ConfigManager.js");
const Sequelize = require("sequelize");

class Guild extends BaseModel {
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
		}
	};

	static options = {
		timestamps: false,
		tableName: "guild"
	};

	/**
	 * Resolving Guild instance and returns prefix if set.
	 * @param {string} guildId Discord Guild ID.
	 * @return {Promise<{guildInstance: Guild, prefix: string}>} Guild instance and prefix resolved using Config class.
	 */
	static async resolvePrefix(guildId) {
		let prefix = Config.get("preferences.cognitum.prefix");
		const guild = await Guild.findOrCreate({
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

module.exports = Guild;
