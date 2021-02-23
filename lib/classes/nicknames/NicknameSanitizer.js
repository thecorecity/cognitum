const TransliterateLatinOnlyMode = require("./modes/TransliterateLatinOnlyMode");

class NicknameSanitizer {
	/**
	 * @type {BaseSanitizerMode}
	 */
	#currentMode;

	/**
	 * @param {string} value Value for sanitizing.
	 * @param {string} mode Mode of the sanitizer.
	 */
	constructor(value, mode = this.constructor.defaultMode) {
		if (!this.constructor.#modes.hasOwnProperty(mode))
			throw new Error(`Following mode not exist: ${mode}!`);
		this.#currentMode = new this.constructor.#modes[mode](value);
	}

	/**
	 * Execute sanitizer and return new nickname value if required.
	 * @return {string}
	 */
	execute() {
		if (this.#currentMode.validate())
			return this.#currentMode.value;
		return this.#currentMode.sanitize();
	}

	/**
	 * Validate current nickname.
	 * @return {boolean}
	 */
	validate() {
		return this.#currentMode.validate();
	}

	/**
	 * List of registered modes.
	 * @type {Record<string, typeof BaseSanitizerMode>}
	 */
	static #modes = {
		[TransliterateLatinOnlyMode.getCode()]: TransliterateLatinOnlyMode
	};

	/**
	 * Get list of existing modes keys. Can be used to check if this mode exist or for listing all available modes.
	 * @return {string[]}
	 */
	static getModesKeys() {
		return Object.keys(this.#modes);
	}

	/**
	 * Check is following mode exist.
	 * @param {string} mode Mode key.
	 * @return {boolean} Is this mode exist.
	 */
	static isModeExist(mode) {
		return this.#modes.hasOwnProperty(mode);
	}

	/**
	 * Default sanitizing mode key.
	 * @type {string}
	 */
	static #defaultMode = TransliterateLatinOnlyMode.getCode();

	/**
	 * Public getter without ability to override default mode key.
	 * @return {string}
	 */
	static get defaultMode() {
		return this.#defaultMode;
	}
}

module.exports = NicknameSanitizer;
