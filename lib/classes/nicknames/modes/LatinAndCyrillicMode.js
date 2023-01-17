const BaseSanitizerMode = require("../../base/BaseSanitizerMode");

/**
 * Mode: Allow only latin and cyrillic symbols to be present.
 */
class LatinAndCyrillicMode extends BaseSanitizerMode {
	static code = "latin_cyrillic";
	static placeholder = "Rename Me";
	static #validateRegexp = /^[^\wА-яЁё]|[^\w\dА-яЁё]$|[^\w\d\sА-я'._-]/g;

	static get validator() {
		this.#validateRegexp.lastIndex = 0;
		return this.#validateRegexp;
	}

	sanitize() {
		return this.#removeOtherSymbols(this.value);
	}

	validate() {
		return !this.constructor.validator.test(this.value);
	}

	#removeOtherSymbols() {
		return this.value.replace(this.constructor.validator, "");
	}
}

module.exports = LatinAndCyrillicMode;
