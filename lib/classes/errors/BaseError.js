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
	 * @param {CommandContext} embedOptions.context Target command context.
	 * @param {ThumbnailMode} [embedOptions.thumbnailMode="self"] (Optional) Suggested thumbnail mode for error.
	 * @return {ErrorEmbed} Formatted embed for current embed.
	 */
	toEmbed({ context, thumbnailMode }) {
		const embed = new ErrorEmbed(
			context.getMessage(), thumbnailMode
		);
		const embedOptions = this.generateEmbedOptions(context);
		embed
			.setTitle(
				context.getLang().get(
					this.generateEmbedTitle(),
					embedOptions
				)
			)
			.setDescription(
				context.getLang().get(
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
	 * @param {CommandContext} context Link to current command context. Can be used to generate options.
	 * @return {Object<string, string>} Replacement values map.
	 * @private
	 */
	// eslint-disable-next-line no-unused-vars
	generateEmbedOptions(context) {
		return {
			errorMessage: this.message
		};
	}
}

module.exports = BaseError;
