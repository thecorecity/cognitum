const BaseModel = require("./BaseModel.js");
const Guild = require("./Guild.js");
const User = require("./User.js");
const Sequelize = require("sequelize");

class GuildMember extends BaseModel {
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

module.exports = GuildMember;
