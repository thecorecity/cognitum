const BaseModel = require("../../classes/base/BaseModel");
const Guild = require("./GuildModel");
const Sequelize = require("sequelize");

class GuildChannelModel extends BaseModel {
	/**
	 * ID of the guild channel.
	 * @type {string|BigInt}
	 */
	id;

	/**
	 * ID of the guild.
	 * @type {string|BigInt}
	 */
	id_guild;

	/**
	 * Flag for the hiding guild channel.
	 * @type {0|1}
	 */
	hidden;

	static attributes = {
		id: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			primaryKey: true,
		},
		id_guild: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: Guild,
				key: "id"
			}
		},
		hidden: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	};

	static options = {
		tableName: "channel",
		timestamps: false
	};
}

module.exports = GuildChannelModel;
