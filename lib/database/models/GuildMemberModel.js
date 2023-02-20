const BaseModel = require("../../classes/base/BaseModel");
const GuildModel = require("./GuildModel");
const UserModel = require("./UserModel");
const Sequelize = require("sequelize");

class GuildMemberModel extends BaseModel {
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
				model: GuildModel,
				key: "id"
			}
		},
		id_user: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			references: {
				model: UserModel,
				key: "id"
			}
		},
		access: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		},
		message: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		},
		voice: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: true
		}
	};

	static initOptions = {
		tableName: "member",
		timestamps: false
	};
}

module.exports = GuildMemberModel;
