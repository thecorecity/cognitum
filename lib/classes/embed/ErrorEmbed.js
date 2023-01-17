const DefaultEmbed = require("./DefaultEmbed");
const Config = require("../ConfigManager");

/**
 * # Error Embed
 * Default error embed layout.
 */
class ErrorEmbed extends DefaultEmbed {
	/**
	 * @param {import("discord.js").Message | CommandContext} target Target message of command context.
	 * @param {ThumbnailMode} [thumbnailMode = "self"] (Optional) Thumbnail mode.
	 */
	constructor(target, thumbnailMode = "self") {
		super(target, thumbnailMode);
		this
			.setTitle(this.lang.get("embed.errors.default.title"))
			.setDescription(this.lang.get("embed.errors.default.description"))
			.setColor(Config.get("preferences.cognitum.embedColors.error"));
	}
}

module.exports = ErrorEmbed;
