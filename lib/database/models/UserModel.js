const BaseModel = require("../../classes/base/BaseModel");
const Sequelize = require("sequelize");
const GuildMemberModel = require("./GuildMemberModel");

class UserModel extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.BIGINT.UNSIGNED,
			allowNull: false,
			primaryKey: true
		},
		access: {
			type: Sequelize.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	};

	static options = {
		tableName: "user",
		timestamps: false,
		associate() {
			UserModel.hasMany(GuildMemberModel, { foreignKey: "id_user" });
		}
	};
}

module.exports = UserModel;
