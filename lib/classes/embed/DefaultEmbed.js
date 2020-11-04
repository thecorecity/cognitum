const Config = require("../ConfigManager.js");
const Lang = require("../localization/Lang.js");
const { MessageEmbed } = require("discord.js");

/**
 * Available thumbnail modes.
 * @typedef {"guild"|"user"|"self"} ThumbnailMode
 */
/**
 * # Default Embed
 *
 * Default embed with sample title, description and resolved thumbnail.
 */
class DefaultEmbed extends MessageEmbed {
	/**
	 * Private lang instance.
	 * @type {Lang}
	 */
	lang;

	/**
	 * Map of functions for receiving different icons types for default embed.
	 * @type {Object<ThumbnailMode, function: string>}
	 */
	static #resolveThumbnail = {
		/**
		 * Get guild icon from message guild.
		 * @param {Message} message Target message.
		 * @return {string|null} Picture URL.
		 */
		guild(message) {
			return message.guild.iconURL();
		},
		/**
		 * Get author avatar from message.
		 * @param {Message} message Target message.
		 * @return {string} Picture URL.
		 */
		user(message) {
			return message.author.avatarURL();
		},
		/**
		 * Get bot avatar.
		 * @param {Message} message Target message.
		 * @return {string} Picture URL.
		 */
		self(message) {
			return message.client.user.avatarURL();
		}
	};

	/**
	 * @param {Message | CommandContext} target Target message or current command context.
	 * @param {ThumbnailMode} [thumbnailMode="self"] (Optional) Thumbnail mode.
	 */
	constructor(target, thumbnailMode = "self") {
		super();
		let message;
		if (target.constructor.name === "CommandContext") {
			message = target.getMessage();
			this.lang = target.getLang();
		} else if (target.constructor.name === "Message") {
			// TODO Resolving language from message
			this.lang = new Lang("en");
			message = target;
		}
		this.title = this.lang.get("embed.default.title");
		this.description = this.lang.get("embed.default.description");
		this.thumbnail = {
			url: DefaultEmbed.#resolveThumbnail[thumbnailMode]?.(message) ?? message.client.user.avatarURL()
		};
		this.color = Config.get("preferences.cognitum.embedColors.default");
	}
}

module.exports = DefaultEmbed;
