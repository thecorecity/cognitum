const BaseCommand = require("../../classes/base/BaseCommand");
const ArgumentError = require("../../classes/errors/ArgumentError");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const OrderedList = require("../../classes/content/OrderedList");
const HiddenCategory = require("../../categories/HiddenCategory");
const CallerPermissionError = require("../../classes/errors/CallerPermissionError");
const DocumentError = require("../../classes/errors/commands/DocumentError");
const { GuildMemberModel, DocumentModel } = require("../../classes/Database");
const { escapeMarkdown } = require("../../classes/Utils");

class DocumentCommand extends BaseCommand {
	async run() {
		if (this.args.length === 1) {
			const slug = this.args.shift();
			if (!this.constructor.#reservedCommandWords.includes(slug))
				return await this.#displayDocument(slug);
			if (slug !== "list")
				throw new ArgumentError("value", {
					argumentPassed: slug
				});
			return await this.#displayDocumentsList();
		}
		if (this.args.length === 2) {
			const command = this.args.shift();
			const param = this.args.shift();
			if (!this.constructor.#reservedCommandWords.includes(command))
				return await this.#displayArgumentError(command);
			if (command === "list")
				return await this.#displayDocumentsList(
					isFinite(parseInt(param))
						? parseInt(param)
						: 1
				);
			if ((command === "create" || command === "edit") && await this.#checkPermissions(["ADMINISTRATOR"]))
				return await this.#pushDocument(param, command === "create");
			if (command === "delete" && await this.#checkPermissions(["ADMINISTRATOR"]))
				return await this.#deleteDocument(param);
		}
		if (this.args.length >= 3) {
			const command = this.args.shift();
			const slug = this.args.shift();
			const content = this.args.join(" ");
			if (command === "rename" && await this.#checkPermissions(["ADMINISTRATOR"]))
				return await this.#renameDocument(slug, content);
			if (command === "image" && await this.#checkPermissions(["ADMINISTRATOR"]))
				return await this.#attachImage(slug, content);
			return await this.#displayArgumentError(command);
		}
		throw new DocumentError("usage");
	}

	/**
	 * Check following permissions.
	 * @param {PermissionString[]} permissions
	 * @return {Promise<boolean>} If everything fine it resolves.
	 * @throws {CallerPermissionError} If member missing one of the passed permissions.
	 */
	async #checkPermissions(permissions) {
		if (!this.message.member.hasPermission(permissions))
			throw new CallerPermissionError("Executor missing required permissions!", permissions);
		return true;
	}

	/**
	 * Display document by it's slug-name.
	 * @param {string} documentSlug Document name.
	 * @return {Promise<DefaultEmbed>} Resolved and rendered document.
	 * @throws {Error} If this document is missing.
	 */
	async #displayDocument(documentSlug) {
		const document = await this.#resolveDocument(documentSlug);
		if (!document)
			throw new DocumentError("missing");
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(document["title"])
			.setDescription(document["content"]);
		if (document["image_url"]?.length > 0 && /^https?:\/\//.test(document["image_url"]))
			embed.setImage(document["image_url"]);
		return embed;
	}

	/**
	 * Display list of documents for current guild.
	 * @param {number} pageNumber = 1 Number of requested page.
	 * @return {Promise<DefaultEmbed>} Rendered list of documents.
	 */
	async #displayDocumentsList(pageNumber = 1) {
		if (pageNumber <= 0)
			pageNumber = 1;
		const offset = (pageNumber - 1) * 10;
		const { rows } = await DocumentModel.findAndCountAll({
			where: {
				hidden: 0
			},
			include: [
				{
					model: GuildMemberModel,
					where: {
						id_guild: this.message.guild.id
					}
				}
			],
			limit: 10,
			offset
		});
		const orderedList = new OrderedList();
		orderedList.setStyler(OrderedList.STYLER_DOTTED);
		orderedList.startPoint = offset + 1;
		rows.forEach(documentInstance => {
			orderedList.push(`${escapeMarkdown(documentInstance["name"])} ${documentInstance["title"]}`);
		});
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang("command.doc.list.title")
			)
			.setDescription(
				rows.length
					? orderedList.toString()
					: this.resolveLang("command.doc.list.descriptionEmpty")
			)
			.setFooter(
				this.resolveLang("command.doc.list.pagerFooter", {
					pageNumber
				})
			);
		return embed;
	}

	/**
	 * Push document to the database.
	 * @param {string} slug Target document slug.
	 * @param {boolean} isNew Is this request for new document or existing document update.
	 * @return {Promise<DefaultEmbed>} Response after successful action.
	 * @throws {Error} If this is request for the new document and document with following slug already exist.
	 * @throws {Error} If this is request for updating existing document and document is missing.
	 * @throws {Error} If document creation canceled by user or time for document content pushing is out.
	 */
	async #pushDocument(slug, isNew) {
		const document = await this.#resolveDocument(slug);
		if (isNew && document)
			throw new DocumentError("exist");
		if (!isNew && !document)
			throw new DocumentError("missing");
		const content = await this.#requestDocumentContent(isNew);
		if (isNew) {
			await DocumentModel.create({
				id_member: this.context.getDatabaseInstances().member["id"],
				name: slug,
				title: this.resolveLang("command.doc.newDocumentTitle"),
				content
			});
		} else {
			document["content"] = content;
			await document.save();
		}
		const embed = new DefaultEmbed(this.context, "guild");
		const base = "command.doc.success." + (isNew ? "created" : "updated");
		embed
			.setTitle(
				this.resolveLang(`${base}.title`)
			)
			.setDescription(
				this.resolveLang(`${base}.description`, { slug })
			);
		return embed;
	}

	/**
	 * Request new document content in next message.
	 * @param {boolean} isNew Is this request for new document or not.
	 * @return {Promise<string|null>}
	 * @throws {Error} If user canceling action by himself.
	 * @throws {Error} If timeout for new message happened.
	 */
	async #requestDocumentContent(isNew) {
		const langBase = "command.doc.request." + (isNew ? "create" : "update");
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang(`${langBase}.title`)
			)
			.setDescription(
				this.resolveLang(`${langBase}.description`)
			)
			.setFooter(
				this.resolveLang("command.doc.pushDocumentFooter")
			);
		await this.message.channel.send(embed);
		let content;
		try {
			/** @type {Collection<Snowflake, Message>} */
			const messages = await this.message.channel.awaitMessages(
				message => message.author.equals(this.message.author),
				{
					time: 60000,
					max: 1,
					errors: ["time"]
				}
			);
			content = messages.last()?.content;
		} catch (e) {
			throw new DocumentError("timeout");
		}
		if (content === "cancel")
			throw new DocumentError("canceled");
		return content?.length ? content : null;
	}

	/**
	 * Delete document by slug.
	 * @param {string} documentSlug Document slug-name.
	 * @return {Promise<DefaultEmbed>} Message about successful document deletion.
	 * @throws {Error} If document with current slug is not found.
	 */
	async #deleteDocument(documentSlug) {
		const document = await this.#resolveDocument(documentSlug);
		if (!document)
			throw new DocumentError("missing");
		await document.destroy();
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang("command.doc.success.deleted.title")
			)
			.setDescription(
				this.resolveLang("command.doc.success.deleted.description", {
					slug: document["name"]
				})
			);
		return embed;
	}

	/**
	 * Rename target document title.
	 * @param {string} documentSlug Document name-slug.
	 * @param {string} title New title for document.
	 * @return {Promise<DefaultEmbed>} Successful document.
	 * @throws {Error} If document missing.
	 */
	async #renameDocument(documentSlug, title) {
		const document = await this.#resolveDocument(documentSlug);
		if (!document)
			throw new DocumentError("missing");
		document["title"] = title;
		await document.save();
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang("command.doc.success.rename.title")
			)
			.setDescription(
				this.resolveLang("command.doc.success.rename.description", {
					slug: documentSlug,
					updatedTitle: title
				})
			);
		return embed;
	}

	/**
	 * Attach image to the target document.
	 * @param {string} documentSlug Document slug-name.
	 * @param {string} link Image link.
	 * @return {Promise<DefaultEmbed>} Message about successful image bind.
	 * @throws {Error} If target document not founded.
	 */
	async #attachImage(documentSlug, link) {
		const document = await this.#resolveDocument(documentSlug);
		if (!document)
			throw new DocumentError("missing");
		document["image_url"] = link;
		await document.save();
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang("command.doc.success.attachment.title")
			)
			.setDescription(
				this.resolveLang("command.doc.success.attachment.description", {
					slug: documentSlug
				})
			)
			.setImage(link);
		return embed;
	}

	/**
	 * Resolve document model object by slug.
	 * @param {string} documentSlug Document slug-name.
	 * @return {Promise<DocumentModel|null>} Resolved document model or null if nothing found.
	 */
	async #resolveDocument(documentSlug) {
		return DocumentModel.findOne({
			where: {
				name: documentSlug,
				hidden: 0
			},
			include: [
				{
					model: GuildMemberModel,
					where: {
						id_guild: this.message.guild.id
					}
				}
			]
		});

	}

	/**
	 * Throw error for target command passed.
	 * @param {string} commandPassed Incorrect command for argument error render.
	 * @return {Promise<void>} Returns nothing.
	 * @throws {ArgumentError} Error with passed command and list of available commands.
	 */
	async #displayArgumentError(commandPassed) {
		throw new ArgumentError("valueList", {
			argumentPassed: commandPassed,
			argumentExpectedList: this.constructor.#reservedCommandWords
				.map(v => escapeMarkdown(v))
				.join(", ")
		});
	}

	static code = "doc";
	static aliases = ["docs", "man"];
	static usage = "doc { <slug> | list [<page>] | create <slug> | edit <slug> | rename <slug> <heading> | image <slug> <url> | delete <slug> }";
	static category = HiddenCategory.getCode();
	static examples = [
		"example.list",
		"example.open",
		"example.create",
		"example.update",
		"example.rename",
		"example.image",
		"example.delete"
	];

	static #reservedCommandWords = ["list", "create", "edit", "rename", "image", "delete"];

}

module.exports = DocumentCommand;
