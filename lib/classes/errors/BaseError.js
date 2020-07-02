const ErrorEmbed = require("../embed/ErrorEmbed");

// noinspection JSPotentiallyInvalidUsageOfClassThis
class BaseError extends Error {
	/**
	 * Current error code. This property used to resolve embed titles and descriptions.
	 * @type {string}
	 */
	static errorCode = "default";

	/**
	 * @param {string} errorMessage Error message to show in console.
	 */
	constructor(errorMessage) {
		super();
		this.message = errorMessage;
	}

	/**
	 * Create embed from current error context.
	 * @param {Object} embedOptions Options for creating embed.
	 * @param {Lang} embedOptions.lang Language class instance for resolving strings.
	 * @param {Message} embedOptions.message Discord message required for generating embed.
	 * @param {ThumbnailMode} [embedOptions.thumbnailMode="self"] (Optional) Suggested thumbnail mode for error.
	 * @return {ErrorEmbed} Formatted embed for current embed.
	 */
	toEmbed({lang, message, thumbnailMode}) {
		const embed = new ErrorEmbed(message, thumbnailMode);
		const embedOptions = this.generateEmbedOptions();
		embed
			.setTitle(
				lang.get(
					this.generateEmbedTitle(),
					embedOptions
				)
			)
			.setDescription(
				lang.get(
					this.generateEmbedDescription(),
					embedOptions
				)
			);
		return embed;
	}

	/**
	 * Generate lang code for current embed error title.
	 * @return {string} Embed title code.
	 * @private
	 */
	generateEmbedTitle() {
		return `embed.errors.${this.constructor.errorCode}.title`;
	}

	/**
	 * Generate lang code for current embed error description.
	 * @return {string} Embed description code.
	 * @private
	 */
	generateEmbedDescription() {
		return `embed.errors.${this.constructor.errorCode}.description`;
	}

	/**
	 * Get values for replacement.
	 * @return {Object<string, string>} Replacement values map.
	 * @private
	 */
	generateEmbedOptions() {
		return {};
	}
}

module.exports = BaseError;
