const DefaultEmbed = require("./DefaultEmbed.js");
const Config = require("../Config.js");

/**
 * # Error Embed
 * Default error embed layout.
 */
class ErrorEmbed extends DefaultEmbed {
	/**
	 * @param {Message | CommandContext} target Target message of command context.
	 * @param {ThumbnailMode} [thumbnailMode = "self"] (Optional) Thumbnail mode.
	 */
	constructor(target, thumbnailMode = "self") {
		super(target, thumbnailMode);
		this.title = this.lang.get("embed.errors.default.title");
		this.description = this.lang.get("embed.errors.default.description");
		this.color = Config.get("cognitum.embedColors.error");
	}
}

module.exports = ErrorEmbed;
