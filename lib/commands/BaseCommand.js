class BaseCommand {
    options;

    constructor(options) {
        this.options = options;
    }

    static code;
    static title;
    static description;
    static usage;
    static examples;
    static aliases;

    static getCode() {
        return this.code;
    }

    static getTitle() {
        return this.title;
    }

    static getDescription() {
        return this.description;
    }

    static getUsage() {
        return this.usage;
    }

    static getExamples() {
        return this.examples;
    }

    static getAliases() {
        return this.aliases;
    }

    static aliasesAvailable() {
        return this.aliases instanceof Array && this.aliases.length > 0;
    }
}

module.exports = BaseCommand;