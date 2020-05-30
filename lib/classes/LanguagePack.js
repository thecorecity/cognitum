class LanguagePack {
    #code;
    #fields = {};

    constructor(languageCode = "") {
        this.#fields = require(process.cwd() + "/lang/" + languageCode + ".json");
        this.#code = languageCode;
    }

    getValue(fieldCode) {
        if (!this.#fields.hasOwnProperty(fieldCode))
            return fieldCode;
        return this.#fields[fieldCode];
    }

    getLanguageName() {
        return this.#fields._languagePack;
    }

    getAuthor() {
        return this.#fields._languagePackAuthors;
    }

    getVersion() {
        return this.#fields._languagePackVersion;
    }
}

module.exports = LanguagePack;