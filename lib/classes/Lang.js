const {log, fileExtension, fileName} = require('./Utils.js');
const fs = require('fs').promises;
const LanguagePack = require("./LanguagePack.js");

/**
 * @typedef {[{code: string, name: string, version: string, authors: string}]} LanguagesListArray
 */

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
     * @type {LanguagePack}
     */
    #pack;

    /**
     * Language packs loader
     * @param {String} language
     */
    constructor(language) {
        this.#pack = Lang.#languagesPacks[language];
    }

    /**
     * Get text and fill replacements with args object if available.
     * @param {String} code Language pack code.
     * @param {Object} [params] Object of parameters for replacing.
     */
    get(code, params = {}) {
        let text = this.#pack.getValue(code);
        // Fallback for non-english language packs
        if (text === code && this.#pack.code !== "en")
            text = Lang.#languagesPacks['en'].getValue(code);
        if (Object.keys(params).length > 0)
            text = this.#fillReplacements(text, params);
        return text;
    }

    /**
     * Searching for #codeReplacements# and replacing it from args object
     * @param {String} text
     * @param {Object} params
     */
    #fillReplacements = function (text, params) {
        return text.replace(/%([A-Za-z_\-]+)%/i, (match, code) => {
            if (params.hasOwnProperty(code))
                return params[code];
            return match;
        })
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
        files.forEach(fileWithExtension => {
            if (fileWithExtension.startsWith('_'))
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
            })
        }
        return languages;
    }
}

module.exports = Lang;