/**
 * # BaseStringableError
 *
 * This class used to create errors with stringable message, without embed.
 */
export default class StringableError extends Error {
	constructor(errorMessage: string) {
		super();
		this.message = errorMessage;
	}

	toString() {
		return this.message;
	}
}
