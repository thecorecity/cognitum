import BaseSanitizerMode from "../base/BaseSanitizerMode";

/**
 * Mode: Allow only latin and cyrillic symbols to be present.
 */
export default class LatinAndCyrillicMode extends BaseSanitizerMode {
	static code = "latin_cyrillic";
	static placeholder = "Rename Me";
	static #validateRegexp = /^[^\wА-яЁё]|[^\wА-яЁё]$|[^\w\sА-я'.-]/g;

	static get validator() {
		this.#validateRegexp.lastIndex = 0;
		return this.#validateRegexp;
	}

	sanitize() {
		return this.#removeOtherSymbols();
	}

	validate() {
		return !LatinAndCyrillicMode.validator.test(this.value);
	}

	#removeOtherSymbols() {
		return this.value.replace(LatinAndCyrillicMode.validator, "");
	}
}
