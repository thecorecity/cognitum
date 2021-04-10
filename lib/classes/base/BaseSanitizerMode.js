/**
 * @abstract
 */
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
	 * Placeholder for the fully invalid nicknames.
	 * @return {string}
	 */
	get placeholder() {
		return this.constructor.placeholder;
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

	/**
	 * @abstract
	 * @type {string}
	 */
	static code = "base";

	/**
	 * @abstract
	 * @type {string}
	 */
	static placeholder = "";

	static getCode() {
		return this.code;
	}
}

module.exports = BaseSanitizerMode;
