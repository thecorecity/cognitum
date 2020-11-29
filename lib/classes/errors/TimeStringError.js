const BaseError = require("../base/BaseError");

class TimeStringError extends BaseError {
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
		/** @type {Lang} */
		const lang = context.getLang();
		return {
			details: lang.get(`embed.errors.${this.constructor.errorCode}.details.${this.#details}`)
		};
	}

	static errorCode = "timeString";
}

module.exports = TimeStringError;
