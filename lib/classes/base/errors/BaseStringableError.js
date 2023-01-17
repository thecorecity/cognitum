/**
 * # BaseStringableError
 *
 * This class used to create errors with stringable message, without embed.
 */
class BaseStringableError extends Error {
	constructor(errorMessage) {
		super();
		this.message = errorMessage;
	}

	toString() {
		return this.message;
	}
}

module.exports = BaseStringableError;
