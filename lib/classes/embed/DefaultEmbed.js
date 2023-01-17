const Config = require("../ConfigManager");
const Lang = require("../localization/Lang");
const { Message, EmbedBuilder } = require("discord.js");
const CommandContext = require("../commands/CommandContext");
const InteractionContext = require("../commands/InteractionContext");

/**
 * Available thumbnail modes.
 * @typedef {"guild"|"user"|"self"} ThumbnailMode
 */

/**
 * # Default Embed
 *
 * Default embed with sample title, description and resolved thumbnail.
 */
class DefaultEmbed extends EmbedBuilder {
	/**
	 * Private lang instance.
	 * @type {Lang}
	 */
	lang;

	/**
	 * Map of functions for receiving different icons types for default embed.
	 * @type {Object<ThumbnailMode, Function>}
	 */
	static #resolveThumbnail = {
		/**
		 * Get guild icon from message guild.
		 * @param {import("discord.js").Message} message Target message.
		 * @return {string|null} Picture URL.
		 */
		guild(message) {
			return message.guild.iconURL();
		},
		/**
		 * Get author avatar from message.
		 * @param {import("discord.js").Message} message Target message.
		 * @return {string} Picture URL.
		 */
		user(message) {
			return message.author.avatarURL();
		},
		/**
		 * Get bot avatar.
		 * @param {import("discord.js").Message} message Target message.
		 * @return {string} Picture URL.
		 */
		self(message) {
			return message.client.user.avatarURL();
		}
	};

	/**
	 * @param {import("discord.js").Message | CommandContext | InteractionContext} target Target message or current command context.
	 * @param {ThumbnailMode} [thumbnailMode="self"] (Optional) Thumbnail mode.
	 */
	constructor(target, thumbnailMode = "self") {
		super();

		/** @type {import('discord.js').Message|import('discord.js').Interaction|undefined} */
		let interactionOrMessage;
		if (target instanceof InteractionContext) {
			interactionOrMessage = target.interaction;
			this.lang = target.lang;
		} else if (target instanceof CommandContext) {
			interactionOrMessage = target.message;
			this.lang = target.lang;
		} else if (target instanceof Message) {
			// TODO Resolving language from message
			this.lang = new Lang("en");
			interactionOrMessage = target;
		} else {
			throw new Error("Invalid embed target passed! DefaultEmbed accepts Message, CommandContext or InteractionContext!");
		}

		this
			.setTitle(this.lang.get("embed.default.title"))
			.setDescription(this.lang.get("embed.default.description"))
			.setThumbnail(DefaultEmbed.#resolveThumbnail[thumbnailMode]?.(interactionOrMessage) ?? interactionOrMessage.client.user.avatarURL())
			.setColor(Config.get("preferences.cognitum.embedColors.default"));
	}
}

module.exports = DefaultEmbed;
