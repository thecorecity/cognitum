const BaseModel = require("../../classes/base/BaseModel");
const GuildMemberModel = require("./GuildMemberModel");
const Sequelize = require("sequelize");

class DocumentModel extends BaseModel {
	static attributes = {
		id: {
			type: Sequelize.INTEGER.UNSIGNED,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		id_member: {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			references: {
				model: GuildMemberModel,
				key: "id"
			}
		},
		name: {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false
		},
		title: {
			type: Sequelize.TEXT({
				length: "tiny"
			}),
			allowNull: false,
			defaultValue: "Title"
		},
		content: {
			type: Sequelize.TEXT,
			allowNull: false
		},
		image_url: {
			type: Sequelize.STRING({
				length: 512
			}),
			allowNull: true
		},
		hidden: {
			type: Sequelize.TINYINT.UNSIGNED,
			allowNull: false,
			defaultValue: 0
		}
	};

	static options = {
		tableName: "doc",
		timestamps: false,
		associate() {
			DocumentModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		}
	};
}

module.exports = DocumentModel;
