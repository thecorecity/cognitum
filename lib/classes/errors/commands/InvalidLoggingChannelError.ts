import EmbeddableError from "../base/EmbeddableError";

type InvalidLoggingChannelErrorType = "unusualChannelType" | "invalidChannel" | "invalidChannelId" | "missingChannel";

export default class InvalidLoggingChannelError extends EmbeddableError {
	readonly #maybeChannelId: string;

	static errorCode = "invalidLoggingChannel";

	constructor(detailCode: InvalidLoggingChannelErrorType, maybeChannelId: string = "") {
		super(detailCode);

		this.#maybeChannelId = maybeChannelId;
	}

	protected generateEmbedTitle(): string {
		return `embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.${this.message}.title`;
	}

	protected generateEmbedDescription(): string {
		return `embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.${this.message}.description`;
	}

	// noinspection JSCheckFunctionSignatures
	protected generateEmbedOptions(): Record<string, string> {
		return {
			channelId: this.#maybeChannelId
		};
	}
}
