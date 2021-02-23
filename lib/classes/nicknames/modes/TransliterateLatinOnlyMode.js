const BaseSanitizerMode = require("../../base/BaseSanitizerMode");
const cyrillicToLatinMap = require("../transliteration/CyrillicToLatin");

class TransliterateLatinOnlyMode extends BaseSanitizerMode {
	static code = "latin";
	static validateRegexp = /(?:^[^\w]|[^\w\d]$|[^\w\d\s'._-])/g

	sanitize() {
		let v = this.value;
		v = this.transliterateCyrillic(v);
		v = this.removeOtherSymbols(v);
		return v;
	}

	/**
	 * Transliterate cyrillic symbols.
	 * @param {string} value Value for transliteration.
	 * @return {string} Transliterated string.
	 */
	transliterateCyrillic(value) {
		return value.replace(/[А-Яа-яЁё]/g, symbol => {
			return cyrillicToLatinMap[symbol] ?? symbol;
		});
	}

	/**
	 * Remove other symbols.
	 * @param {string} value Value for clearing other symbols.
	 * @return {string} Clean
	 */
	removeOtherSymbols(value) {
		this.constructor.validateRegexp.lastIndex = 0;
		return value.replace(this.constructor.validateRegexp, "");
	}

	validate() {
		this.constructor.validateRegexp.lastIndex = 0;
		return !this.constructor.validateRegexp.test(this.value);
	}
}

module.exports = TransliterateLatinOnlyMode;
