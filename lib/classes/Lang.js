const {log, fileExtension, fileName} = require('./Utils.js');
const fs = require('fs').promises;
const LanguagePack = require("./LanguagePack.js");

/**
 * @typedef {[{code: String, name: String, version: String, authors: String}]} LanguagesListArray
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
     * Get text and fill replacements with params object if available
     * @param {String} code
     * @param {Object} [params]
     */
    get(code, params = {}) {
        let text = this.#pack.getValue(code);
        if (Object.keys(params).length > 0)
            text = this.#fillReplacements(text, params);
        return text;
    }

    /**
     * Searching for #codeReplacements# and replacing it from params object
     * @param {String} text
     * @param {Object} params
     */
    #fillReplacements = function(text, params) {
        return text.replace(/#([A-Za-z_\-]+)#/i, (match, code) => {
            if (params.hasOwnProperty(code))
                return params[code];
            return match;
        })
    };

    static #initialized = false;
    static #languagesPacks = {};

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
     * @return {LanguagesListArray}
     */
    static getLanguagesList() {
        const languages = [];
        for (const code in this.#languagesPacks) {
            if (!this.#languagesPacks.hasOwnProperty(code))
                continue;
            /**
             * @type {LanguagePack}
             */
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