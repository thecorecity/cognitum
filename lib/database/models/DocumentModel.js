const BaseModel = require("../../classes/base/BaseModel");
const GuildMember = require("./GuildMemberModel");
const Sequelize = require("sequelize");

class DocumentModel extends BaseModel {
	/**
	 * ID of the document.
	 * @type {string}
	 */
	id;

	/**
	 * ID of the member.
	 * @type {number}
	 */
	id_member;

	/**
	 * Name of the document.
	 * @type {string}
	 */
	name;

	/**
	 * Title of the document.
	 * @type {string}
	 */
	title;

	/**
	 * Content of the document.
	 * @type {string}
	 */
	content;

	/**
	 * URL of the image.
	 * @type {string}
	 */
	image_url;

	/**
	 * Flag for the hiding document.
	 * @type {0|1}
	 */
	hidden;

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

module.exports = DocumentModel;
