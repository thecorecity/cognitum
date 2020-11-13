const _ = require("lodash");

/**
 * # Language Pack
 *
 * Its loading pack from this directory:
 *
 * `/lang/{languageCode}.json`
 *
 * @example
 * let pack = new LanguagePack('en');
 *
 * pack.getValue('path.to.field');
 * // Value from `path.to.field`.
 * pack.getLanguageName();
 * // "English"
 * pack.getAuthor();
 * // "The Core Community"
 * pack.getVersion();
 * // "1.0.0"
 */
class LanguagePack {
	/**
	 * Language pack code.
	 * @type {string}
	 */
	#code;

	/**
	 * Language pack fields loaded from JSON.
	 * @type {Object}
	 */
	#fields = {};

	/**
	 * @param {string} languageCode Language code.
	 */
	constructor(languageCode = "") {
		this.#fields = require(process.cwd() + "/lang/" + languageCode + ".json");
		this.#code = languageCode;
	}

	/**
	 * Get value from language pack.
	 * @param {string} fieldCode Path to field.
	 * @return {string} Value from requested path. If nothing found in requested path then it returns requested
	 *     fieldCode. Also if requested value is not a string, it will also returns requested fieldCode.
	 */
	getValue(fieldCode) {
		let result = _.at(this.#fields, [fieldCode])[0] ?? fieldCode;
		if (typeof result !== "string")
			return fieldCode;
		return result;
	}

	/**
	 * Get language name from pack.
	 * @return {string} Language name.
	 */
	getLanguageName() {
		return this.getValue("_languagePack.title");
	}

	/**
	 * Get language pack authors.
	 * @return {string} Language pack authors.
	 */
	getAuthor() {
		return this.getValue("_languagePack.authors");
	}

	/**
	 * Get language pack version.
	 * @return {string} Language pack version.
	 */
	getVersion() {
		return this.getValue("_languagePack.version");
	}

	/**
	 * Getter for language pack code.
	 * @return {string} Language code.
	 */
	get code() {
		return this.#code;
	}
}

module.exports = LanguagePack;
