import _ from "lodash";
import * as fs from "node:fs";

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
export default class LanguagePack {
	/**
	 * Language pack code.
	 */
	readonly #code: string;

	/**
	 * Language pack fields loaded from JSON.
	 */
	readonly #fields: Record<string, string> = {};

	/**
	 * @param languageCode Language code.
	 */
	constructor(languageCode: string = "") {
		this.#fields = JSON.parse(
			fs.readFileSync(process.cwd() + "/lang/" + languageCode + ".json").toString()
		);

		this.#code = languageCode;
	}

	/**
	 * Get value from language pack.
	 * @param fieldCode Path to field.
	 * @return Value from requested path. If nothing found in requested path then it returns requested
	 *     fieldCode. Also if requested value is not a string, it will also returns requested fieldCode.
	 */
	getValue(fieldCode: string): string {
		let result: any = _.at(this.#fields, [fieldCode])[0] ?? fieldCode;
		if (typeof result !== "string")
			return fieldCode;
		return result;
	}

	/**
	 * Get language name from pack.
	 * @return Language name.
	 */
	get languageName() {
		return this.getValue("_languagePack.title");
	}

	/**
	 * Getter for language pack code.
	 * @return Language code.
	 */
	get code() {
		return this.#code;
	}

	/**
	 * Get current date locale.
	 */
	get dateLocale() {
		return this.getValue("_languagePack.dateLocale");
	}
}
