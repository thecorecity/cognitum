const BaseSanitizerMode = require("../../base/BaseSanitizerMode");
const cyrillicToLatinMap = require("../transliteration/CyrillicToLatin");

class TransliterateLatinOnlyMode extends BaseSanitizerMode {
	static code = "latin";
	static placeholder = "Rename Me";
	static #validateRegexp = /^\W|\W$|[^\w\s'.-]/g;

	static get validator() {
		this.#validateRegexp.lastIndex = 0;
		return this.#validateRegexp;
	}

	sanitize() {
		return this.#removeOtherSymbols(
			this.#transliterateCyrillic(
				this.value
			)
		);
	}

	/**
	 * Transliterate cyrillic symbols.
	 * @param {string} value Value for transliteration.
	 * @return {string} Transliterated string.
	 */
	#transliterateCyrillic(value) {
		return value.replace(/[А-Яа-яЁё]/g, symbol => {
			return cyrillicToLatinMap[symbol] ?? symbol;
		});
	}

	/**
	 * Remove other symbols.
	 * @param {string} value Value for clearing other symbols.
	 * @return {string} Clean
	 */
	#removeOtherSymbols(value) {
		return value.replace(this.constructor.validator, "");
	}

	validate() {
		return !this.constructor.validator.test(this.value);
	}
}

module.exports = TransliterateLatinOnlyMode;
