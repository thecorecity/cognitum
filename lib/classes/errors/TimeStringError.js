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
