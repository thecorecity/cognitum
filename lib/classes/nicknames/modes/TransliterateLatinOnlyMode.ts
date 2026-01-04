import BaseSanitizerMode from "../base/BaseSanitizerMode";
import cyrillicToLatinMap from "../transliteration/CyrillicToLatin";

export default class TransliterateLatinOnlyMode extends BaseSanitizerMode {
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
	#transliterateCyrillic(value: string): string {
		return value.replace(/[А-Яа-яЁё]/g, symbol => {
			return cyrillicToLatinMap[symbol] ?? symbol;
		});
	}

	/**
	 * Remove other symbols.
	 * @param {string} value Value for clearing other symbols.
	 * @return {string} Clean
	 */
	#removeOtherSymbols(value: string): string {
		return value.replace(TransliterateLatinOnlyMode.validator, "");
	}

	validate() {
		return !TransliterateLatinOnlyMode.validator.test(this.value);
	}
}
