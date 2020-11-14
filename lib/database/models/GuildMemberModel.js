const BaseModel = require("../../classes/base/BaseModel");
const GuildModel = require("./GuildModel");
const UserModel = require("./UserModel");
const MessageStatisticsModel = require("./MessageStatisticsModel");
const VoiceStatisticsModel = require("./VoiceStatisticsModel");
const DocumentModel = require("./DocumentModel");
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
		}
	};

	static options = {
		tableName: "member",
		timestamps: false,
		associate() {
			GuildMemberModel.belongsTo(GuildModel, { foreignKey: "id_guild" });
			GuildMemberModel.belongsTo(UserModel, { foreignKey: "id_user" });
			GuildMemberModel.hasMany(MessageStatisticsModel, { foreignKey: "id_member" });
			GuildMemberModel.hasMany(VoiceStatisticsModel, { foreignKey: "id_member" });
			GuildMemberModel.hasMany(DocumentModel, { foreignKey: "id_member" });
		}
	};
}

module.exports = GuildMemberModel;
