"use strict";

module.exports = {
	/**
	 * Creating documents table.
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @param {import(sequelize)} Sequelize
	 * @return {Promise<void>}
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("doc", {
			id: {
				type: Sequelize.INTEGER.UNSIGNED,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
				comment: "Internal document ID"
			},
			id_member: {
				type: Sequelize.INTEGER.UNSIGNED,
				allowNull: false,
				comment: "Creator's Discord ID"
			},
			name: {
				type: Sequelize.TEXT({
					length: "tiny"
				}),
				allowNull: false,
				comment: "Document code"
			},
			title: {
				type: Sequelize.TEXT({
					length: "tiny"
				}),
				allowNull: false,
				defaultValue: "Title",
				comment: "Document title"
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: false,
				comment: "Document content"
			},
			image_url: {
				type: Sequelize.STRING({
					length: 512
				}),
				allowNull: true,
				comment: "Link to image, attached to this document"
			},
			hidden: {
				type: Sequelize.TINYINT.UNSIGNED,
				allowNull: false,
				defaultValue: 0,
				comment: "System field for unlisted documents"
			}
		});
		await queryInterface.addConstraint("doc", {
			fields: ["id_member"],
			type: "foreign key",
			name: "fk_document_related_to_guild_member",
			references: {
				table: "member",
				field: "id"
			},
			onDelete: "restrict",
			onUpdate: "restrict"
		});
	},
	/**
	 * Simply dropping documents table. All data will be lost on undoing this migration!
	 * @param {import(sequelize).QueryInterface} queryInterface
	 * @return {Promise<void>}
	 */
	down: async (queryInterface) => {
		await queryInterface.removeConstraint("doc", "fk_document_related_to_guild_member");
		await queryInterface.dropTable("doc");
	}
};
