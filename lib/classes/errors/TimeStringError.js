import EmbeddableError from "../errors/base/EmbeddableError";

export default class TimeStringError extends EmbeddableError {
	#details;

	/**
	 * @param {string} details Error details lang code.
	 */
	constructor(details) {
		super(`Some of the parameters are invalid! Details: ${details}.`);
		this.#details = details;
	}

	/**
	 * @param {CommandContext} context Command context.
	 * @return {{details: string}} Generated options for replacements.
	 */
	generateEmbedOptions(context) {
		return {
			details: context.lang.get(`embed.errors.${this.constructor.errorCode}.details.${this.#details}`)
		};
	}

	static errorCode = "timeString";
}
