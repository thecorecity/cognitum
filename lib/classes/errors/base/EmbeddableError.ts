import ErrorEmbed from "../../embed/ErrorEmbed";
import type CommandContext from "../../commands/CommandContext";
import type { ThumbnailMode } from "../../embed/DefaultEmbed";

/**
 * Options for creating embed.
 */
interface EmbedConversionOptions {
	/**
	 * Target command context.
	 */
	context: CommandContext;
	/**
	 * (Optional) Suggested thumbnail mode for error.
	 */
	thumbnailMode?: ThumbnailMode;
}

// noinspection JSPotentiallyInvalidUsageOfClassThis
export default class EmbeddableError extends Error {
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
	 * @param embedOptions Options for creating embed.
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
	 */
	protected generateEmbedTitle(): string {
		return `embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.title`;
	}

	/**
	 * Generate lang code for current embed error description.
	 * @return Embed description code.
	 */
	protected generateEmbedDescription(): string {
		return `embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.description`;
	}

	/**
	 * Get values for replacement.
	 * @param context Link to current command context. Can be used to generate options.
	 * @return Replacement values map.
	 */
	// eslint-disable-next-line no-unused-vars
	protected generateEmbedOptions(context: CommandContext): Record<string, string> {
		return {
			errorMessage: this.message
		};
	}
}
