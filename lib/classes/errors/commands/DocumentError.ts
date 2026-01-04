import EmbeddableError from "../base/EmbeddableError";

type DocumentErrorType = "exist" | "timeout" | "canceled" | "missing" | "usage";

export default class DocumentError extends EmbeddableError {
	static errorCode = "documentError";

	/**
	 * @param errorCode Code of document error.
	 */
	constructor(errorCode: DocumentErrorType) {
		super(errorCode);
	}

	protected generateEmbedTitle(): string {
		return `embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.${this.message}.title`;
	}

	protected generateEmbedDescription(): string {
		return `embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.${this.message}.description`;
	}
}
