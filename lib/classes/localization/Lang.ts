import {checkObjectKeySafety, createModuleLogger, fileExtension, fileName} from "../Utils";
import {promises as fs} from "fs";
import LanguagePack from "./LanguagePack";

const logger = createModuleLogger("localization");

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
export default class Lang {
	/**
	 * Current selected language pack.
	 */
	readonly #pack: LanguagePack;

	/**
	 * @param language Language pack code.
	 */
	constructor(language: string) {
		if (!Lang.#languagesPacks.hasOwnProperty(language)) {
			logger.warn(`Failed to load language: ${language}. Using base language instead.`);
			logger.warn("Traceroute:");
			console.trace();
			language = Lang.#baseLanguage;
		}
		this.#pack = Lang.#languagesPacks[language];
	}

	/**
	 * Get text and fill replacements with args object if available.
	 * @param code Language pack code.
	 * @param [params] (Optional) Object of parameters for replacing.
	 * @return Returns text from selected language pack.
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
	 * // This is example for you, John!
	 */
	get(code: string, params: ReplacementValuesMap = {}): string {
		let text = this.#pack.getValue(code);
		// Fallback for non-english language packs
		if (this.#pack.code !== Lang.#baseLanguage && text === code)
			text = Lang.#languagesPacks[Lang.#baseLanguage].getValue(code);
		if (Object.keys(params).length > 0)
			text = this.#fillReplacements(text, params);
		return text;
	}

	/**
	 * Searching for %codeReplacements% and replacing it from args object
	 * @param text Original text with replacements fields.
	 * @param params List of parameters for replacement.
	 * @return Text with replaced values.
	 * @private
	 */
	#fillReplacements(text: string, params: ReplacementValuesMap): string {
		return text.replace(/%([A-Za-z_-]+)%/g, (match, code) => {
			if (params.hasOwnProperty(code))
				return params[code].toString();
			return match;
		});
	};

	/**
	 * Format date by selected language locale.
	 * @param target
	 */
	formatDate(target: Date): string {
		return target.toLocaleString(this.#pack.dateLocale);
	}

	/**
	 * Get language name from current selected pack.
	 * @return Language name.
	 */
	get languageName() {
		return this.#pack.languageName;
	}

	/**
	 * Flag for preventing reinitialization using `initialize()` method.
	 */
	static #initialized: boolean = false;

	/**
	 * Languages packs list. Language code as keys and LanguagePack instances as values.
	 * @type {Object<string, LanguagePack>}
	 */
	static #languagesPacks: Record<string, LanguagePack> = {};

	/**
	 * Base language pack code.
	 * @type {string}
	 */
	static #baseLanguage: string = "en";

	/**
	 * Languages initialization method. Loads all packs from `/lang` directory and caching all packs for requesting
	 * different languages in code.
	 * @return {Promise<void>}
	 */
	static async initialize(): Promise<void> {
		if (this.#initialized)
			return void logger.warn("Language packs system already loaded!");

		logger.info("Loading languages packs in asynchronous mode...");

		const files: string[] = await fs.readdir(process.cwd() + "/lang/");

		// English language pack is required for work!
		if (!files.includes("en.json")) {
			logger.error("English language pack is not available at /lang/ directory!");
			process.exit();
		}

		files.forEach(fileWithExtension => {
			if (fileWithExtension.startsWith("_"))
				return;
			const languageCode = fileName(fileWithExtension);
			const extension = fileExtension(fileWithExtension);
			if (!checkObjectKeySafety(languageCode))
				return logger.warn(`Invalid filename for localization pack: ${languageCode}! Skipping...`);
			if (typeof extension !== "string" || extension !== "json")
				return logger.warn(`Language pack have wrong extension at /lang/${fileWithExtension}! Skipping...`);
			const pack = new LanguagePack(languageCode);
			this.#languagesPacks[pack.code] = pack;
			logger.debug(`Language pack loaded: ${pack.languageName}!`);
		});

		this.#initialized = true;
	}

	/**
	 * Get languages list loaded on initialization.
	 * @return List of packs with metadata about this packs.
	 */
	static getLanguagesList(): LanguagesListArray {
		const languages: LanguagesListArray = [];

		for (const code in this.#languagesPacks) {
			if (!this.#languagesPacks.hasOwnProperty(code))
				continue;
			const pack = this.#languagesPacks[code];
			languages.push({
				code,
				name: pack.languageName
			});
		}

		return languages;
	}

	/**
	 * Check is language pack with passed code is exist.
	 * @param code Language code.
	 * @return Is this language pack exist.
	 */
	static isPackExist(code: string): boolean {
		return this.#languagesPacks.hasOwnProperty(code);
	}
}

/**
 * List of loaded languages. Contains only meta data about languages packs.
 */
type LanguagesListArray = { code: string; name: string; }[];

/**
 * Object with values for replacement.
 */
type ReplacementValuesMap = Record<string, string | number>;
