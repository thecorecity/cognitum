class BaseCommand {
    message;
    args;

    constructor({message = null, args = null} = {}) {
        if (message) this.message = message;
        if (args) this.args = args;
    }

    async run() {
        return false;
    }

    static code;
    static title;
    static description;
    static usage;
    static examples;
    static aliases;
    static category;

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

    static getCategory() {
        return this.category;
    }
}

module.exports = BaseCommand;