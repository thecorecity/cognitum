const BaseError = require("./BaseError.js");

class InvalidArgumentError extends BaseError {
	static errorCode = "invalidArgumentError";

	generateEmbedDescription() {
		return this.message;
	}
}

module.exports = InvalidArgumentError;
