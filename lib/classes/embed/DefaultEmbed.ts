import Config from "../ConfigManager";
import Lang from "../localization/Lang";
import { EmbedBuilder, Message } from "discord.js";
import CommandContext from "../commands/CommandContext";

/**
 * Available thumbnail modes.
 */
export type ThumbnailMode = "guild" | "user" | "self";
/**
 * Function for resolving the URL of thumbnail using the message.
 */
type ThumbnailResolver = (message: Message<true>) => string | null;

/**
 * # Default Embed
 *
 * Default embed with sample title, description and resolved thumbnail.
 */
export default class DefaultEmbed extends EmbedBuilder {
	/**
	 * Private lang instance.
	 */
	protected lang: Lang;

	/**
	 * Map of functions for receiving different icons types for default embed.
	 * @type {Object<ThumbnailMode, Function>}
	 */
	static #resolveThumbnail: Record<ThumbnailMode, ThumbnailResolver> = {
		/**
		 * Get guild icon from message guild.
		 */
		guild: message => message.guild.iconURL(),
		/**
		 * Get author avatar from message.
		 */
		user: message => message.author.avatarURL(),
		/**
		 * Get bot avatar.
		 */
		self: message => message.client.user.avatarURL()
	};

	/**
	 * @param target Target message or current command context.
	 * @param [thumbnailMode="self"] (Optional) Thumbnail mode.
	 */
	constructor(target: Message<true> | CommandContext, thumbnailMode: ThumbnailMode = "self") {
		super();
		let message: Message<true>;
		if (target instanceof CommandContext) {
			message = target.message;
			this.lang = target.lang;
		} else {
			// TODO Resolving language from message
			this.lang = new Lang("en");
			message = target;
		}
		this
			.setTitle(this.lang.get("embed.default.title"))
			.setDescription(this.lang.get("embed.default.description"))
			.setThumbnail(DefaultEmbed.#resolveThumbnail[thumbnailMode]?.(message) ?? message.client.user.avatarURL())
			.setColor(Config.get("preferences.cognitum.embedColors.default"));
	}
}
