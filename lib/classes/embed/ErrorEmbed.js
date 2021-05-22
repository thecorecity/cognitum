const DefaultEmbed = require("./DefaultEmbed");
const Config = require("../ConfigManager");

/**
 * # Error Embed
 * Default error embed layout.
 */
class ErrorEmbed extends DefaultEmbed {
	/**
	 * @param {module:"discord.js".Message | CommandContext} target Target message of command context.
	 * @param {ThumbnailMode} [thumbnailMode = "self"] (Optional) Thumbnail mode.
	 */
	constructor(target, thumbnailMode = "self") {
		super(target, thumbnailMode);
		this.title = this.lang.get("embed.errors.default.title");
		this.description = this.lang.get("embed.errors.default.description");
		this.color = Config.get("preferences.cognitum.embedColors.error");
	}
}

module.exports = ErrorEmbed;
