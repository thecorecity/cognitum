import DefaultEmbed, { ThumbnailMode } from "./DefaultEmbed";
import Config from "../ConfigManager";
import type CommandContext from "../commands/CommandContext";
import type { Message } from "discord.js";

/**
 * # Error Embed
 * Default error embed layout.
 */
export default class ErrorEmbed extends DefaultEmbed {
	/**
	 * @param target Target message of command context.
	 * @param [thumbnailMode = "self"] (Optional) Thumbnail mode.
	 */
	constructor(target: Message<true> | CommandContext, thumbnailMode: ThumbnailMode = "self") {
		super(target, thumbnailMode);
		this
			.setTitle(this.lang.get("embed.errors.default.title"))
			.setDescription(this.lang.get("embed.errors.default.description"))
			.setColor(Config.get("preferences.cognitum.embedColors.error"));
	}
}
