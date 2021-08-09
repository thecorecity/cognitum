const BaseModel = require("../../classes/base/BaseModel");
const Guild = require("./GuildModel");
const User = require("./UserModel");
const Sequelize = require("sequelize");

class GuildMemberModel extends BaseModel {
	/**
	 * Internal ID for this member.
	 * @type {number}
	 */
	id;

	/**
	 * ID of the guild.
	 * @type {string|BigInt}
	 */
	id_guild;

	/**
	 * ID of the user.
	 * @type {string|BigInt}
	 */
	id_user;

	/**
	 * Access level for the member.
	 * @type {number}
	 */
	access;

	static attributes = {
		id: {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		id_guild: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: Guild,
				key: "id"
			}
		},
		id_user: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: User,
				key: "id"
			}
		},
		access: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	};

	static options = {
		tableName: "member",
		timestamps: false
	};
}

module.exports = GuildMemberModel;
