const BaseModel = require("./BaseModel.js");
const GuildMember = require("./GuildMember.js");
const Sequelize = require("sequelize");

class Document extends BaseModel {
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
				model: GuildMember,
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
		timestamps: false
	};
}

module.exports = Document;
