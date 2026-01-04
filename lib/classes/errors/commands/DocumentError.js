import EmbeddableError from "../base/EmbeddableError";

export default class DocumentError extends EmbeddableError {
	static errorCode = "documentError";

	/**
	 * @param {"exist"|"timeout"|"canceled"|"missing"|"usage"} errorCode Code of document error.
	 */
	constructor(errorCode) {
		if (typeof errorCode !== "string")
			throw new TypeError("errorCode must be a string type!");
		super(errorCode);
	}

	generateEmbedTitle() {
		return `embed.errors.${this.constructor.errorCode}.${this.message}.title`;
	}

	generateEmbedDescription() {
		return `embed.errors.${this.constructor.errorCode}.${this.message}.description`;
	}
}
