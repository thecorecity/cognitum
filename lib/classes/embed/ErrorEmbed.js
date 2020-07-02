const DefaultEmbed = require("./DefaultEmbed.js");
const Config = require("../Config.js");

/**
 * # Error Embed
 * Default error embed layout.
 */
class ErrorEmbed extends DefaultEmbed {
	/**
     * @param {Message} message Target message.
     * @param {ThumbnailMode} [thumbnailMode] (Optional) Thumbnail mode. Default value: "self".
     */
	constructor(message, thumbnailMode = "self") {
		super(message, thumbnailMode);
		this.title = this.lang.get("embed.errors.default.title");
		this.description = this.lang.get("embed.errors.default.description");
		this.color = Config.get("cognitum.embedColors.error");
	}
}

module.exports = ErrorEmbed;
