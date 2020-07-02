const {log, fileExtension, fileName} = require("./Utils.js");
const fs = require("fs").promises;
const LanguagePack = require("./LanguagePack.js");

/**
 * # Lang
 * Class for accessing different languages and resolving strings from different languages packs.
 * @example
 * // Lang class must be initialized before calling!
 * const lang = new Lang("en");
 * const ruLang = new Lang("ru");
 *
 * lang.get("bot.name");
 * // Cognitum
 * ruLang.get("bot.name");
 * // Когнитум
 */
class Lang {
	/**
	 * Current selected language pack.
	 * @type {LanguagePack}
	 */
	#pack;

	/**
	 * @param {string} language Language pack code.
	 */
	constructor(language) {
		this.#pack = Lang.#languagesPacks[language];
	}

	/**
	 * Get text and fill replacements with args object if available.
	 * @param {string} code Language pack code.
	 * @param {ReplacementValuesMap} [params] (Optional) Object of parameters for replacing.
	 * @return {string} Returns text from selected language pack.
	 * @example
	 * // Loading pack with next fields:
	 * // command.example.title = "Example command"
	 * // command.example.description = "This is example for you, %user%!"
	 * const lang = new Lang("en");
	 *
	 * lang.get('command.example.title');
	 * // Example command
	 *
	 * lang.get('command.example.description', {
	 *     user: "John"
	 * });
	 * // This is example for you, John
	 */
	get(code, params = {}) {
		let text = this.#pack.getValue(code);
		// Fallback for non-english language packs
		if (this.#pack.code !== "en" && text === code)
			text = Lang.#languagesPacks["en"].getValue(code);
		if (Object.keys(params).length > 0)
			text = this.#fillReplacements(text, params);
		return text;
	}

	/**
	 * Searching for %codeReplacements% and replacing it from args object
	 * @param {string} text Original text with replacements fields.
	 * @param {ReplacementValuesMap} params List of parameters for replacement.
	 * @return {string} Text with replaced values.
	 * @private
	 */
	#fillReplacements = function (text, params) {
		return text.replace(/%([A-Za-z_-]+)%/i, (match, code) => {
			if (params.hasOwnProperty(code))
				return params[code];
			return match;
		});
	};

	/**
	 * Flag for preventing reinitialization using `initialize()` method.
	 * @type {boolean}
	 */
	static #initialized = false;

	/**
	 * Languages packs list. Language code as keys and LanguagePack instances as values.
	 * @type {Object<string, LanguagePack>}
	 */
	static #languagesPacks = {};

	/**
	 * Languages initialization method. Loads all packs from `/lang` directory and caching all packs for requesting
	 * different languages in code.
	 * @return {Promise<void>}
	 */
	static async initialize() {
		if (this.#initialized)
			return log("warn", "Language packs system already loaded!");
		log("log", "Loading languages packs in asynchronous mode...");
		const files = await fs.readdir(process.cwd() + "/lang/");
		// English language pack is required for work!
		if (!files.includes("en.json")) {
			log("error", "English language pack is not available at /lang/ directory!");
			process.exit();
		}
		files.forEach(fileWithExtension => {
			if (fileWithExtension.startsWith("_"))
				return;
			const languageCode = fileName(fileWithExtension);
			const extension = fileExtension(fileWithExtension);
			if (extension !== "json")
				return log("warn", `Language pack have wrong extension at /lang/${fileWithExtension}! Skipping...`);
			const pack = new LanguagePack(languageCode);
			this.#languagesPacks[languageCode] = pack;
			log("success", `Language pack loaded: ${pack.getLanguageName()} (${pack.getVersion()}) by ${pack.getAuthor()}!`);
		});
		this.#initialized = true;
	}

	/**
	 * Get languages list loaded on initialization.
	 * @return {LanguagesListArray} List of packs with metadata about this packs.
	 */
	static getLanguagesList() {
		const languages = [];
		for (const code in this.#languagesPacks) {
			if (!this.#languagesPacks.hasOwnProperty(code))
				continue;
			const pack = this.#languagesPacks[code];
			languages.push({
				code,
				name: pack.getLanguageName(),
				version: pack.getVersion(),
				authors: pack.getAuthor()
			});
		}
		return languages;
	}
}

/**
 * List of loaded languages. Contains only meta data about languages packs.
 *
 * @typedef {[{code: string, name: string, version: string, authors: string}]} LanguagesListArray
 */

/**
 * Object with values for replacement.
 *
 * @typedef {Object<string,string>} ReplacementValuesMap
 */

module.exports = Lang;
