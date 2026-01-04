import ErrorEmbed from "../../embed/ErrorEmbed";
import type CommandContext from "../../commands/CommandContext";
import type { ThumbnailMode } from "../../embed/DefaultEmbed";

interface EmbedConversionOptions {
	context: CommandContext;
	thumbnailMode?: ThumbnailMode;
}

// noinspection JSPotentiallyInvalidUsageOfClassThis
export default class BaseError extends Error {
	/**
	 * Current error code. This property used to resolve embed titles and descriptions.
	 */
	static errorCode: string = "default";

	/**
	 * @param errorMessage Error message to show in console.
	 */
	constructor(errorMessage: string) {
		super();
		this.message = errorMessage;
	}

	/**
	 * Create embed from current error context.
	 * @param {Object} embedOptions Options for creating embed.
	 * @param embedOptions.context Target command context.
	 * @param [embedOptions.thumbnailMode="self"] (Optional) Suggested thumbnail mode for error.
	 * @return Formatted embed for current embed.
	 */
	toEmbed({ context, thumbnailMode }: EmbedConversionOptions): ErrorEmbed {
		const embed = new ErrorEmbed(
			context.message, thumbnailMode
		);
		const embedOptions = this.generateEmbedOptions(context);
		embed
			.setTitle(
				context.lang.get(
					this.generateEmbedTitle(),
					embedOptions
				)
			)
			.setDescription(
				context.lang.get(
					this.generateEmbedDescription(),
					embedOptions
				)
			);
		return embed;
	}

	/**
	 * Generate lang code for current embed error title.
	 * @return Embed title code.
	 * @private
	 */
	generateEmbedTitle(): string {
		return `embed.errors.${(this.constructor as typeof BaseError).errorCode}.title`;
	}

	/**
	 * Generate lang code for current embed error description.
	 * @return Embed description code.
	 * @private
	 */
	generateEmbedDescription(): string {
		return `embed.errors.${(this.constructor as typeof BaseError).errorCode}.description`;
	}

	/**
	 * Get values for replacement.
	 * @param {CommandContext} context Link to current command context. Can be used to generate options.
	 * @return {Object<string, string>} Replacement values map.
	 * @private
	 */
	// eslint-disable-next-line no-unused-vars
	generateEmbedOptions(context: CommandContext): Record<string, string> {
		return {
			errorMessage: this.message
		};
	}
}
