const BaseError = require("./BaseError.js");

class ArgumentError extends BaseError {
	static errorCode = "invalidArgumentError";

	langOptions = {};

	/**
	 * @param {ArgumentErrorType} errorType Error subtype.
	 * @param {Object<string, string>} [langOptions={}] Options for passing on lang calling.
	 */
	constructor(errorType, langOptions = {}) {
		super(errorType);
		this.langOptions = langOptions;
	}

	/**
	 * @param {CommandContext} context
	 * @return {Object<string, string>}
	 */
	generateEmbedOptions(context) {
		/** @type {Lang} */
		const lang = context.getLang();
		return {
			details: lang.get(
				`embed.errors.${this.constructor.errorCode}.${this.message}`,
				this.langOptions
			)
		};
	}
}

module.exports = ArgumentError;
