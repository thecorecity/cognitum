class BaseSanitizerMode {
	#value;

	/**
	 * @param {string} value Value for validation and sanitizing.
	 */
	constructor(value) {
		this.#value = value;
	}

	/**
	 * Current value getter.
	 * @return {string}
	 */
	get value() {
		return this.#value;
	}

	/**
	 * @abstract
	 * @return {boolean}
	 */
	validate() {
		throw new Error("Missing sanitizer validation method!");
	}

	/**
	 * @abstract
	 * @return {string}
	 */
	sanitize() {
		throw new Error("Missing sanitizer sanitize method!");
	}

	static code = "base";

	static getCode() {
		return this.code;
	}
}

module.exports = BaseSanitizerMode;
