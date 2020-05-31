const fs = require('fs').promises;
const {log, fileExtension} = require('./Utils.js');
const BaseCommand = require('../commands/BaseCommand.js');
const BaseCategory = require('../categories/BaseCategory.js');

/**
 * @typedef {BaseCommand} CommandCallable
 * @property {Function} run
 */

class CommandsRegistry {
    static commands = {};
    static aliases = {};
    static categories = {};

    static async initialize() {
        log("info", "Commands system initialization...");
        log("log", "Loading categories...");
        const categoriesDirectory = await fs.readdir(process.cwd() + "/lib/categories");
        categoriesDirectory.forEach(filename => {
            if (filename.startsWith("_"))
                return;
            const extension = fileExtension(filename);
            if (extension !== "js")
                return;
            const Category = require("../categories/" + filename);
            if (!Category.prototype instanceof BaseCategory)
                return;
            const code = Category.getCode();
            if (this.categories.hasOwnProperty(code)) {
                log("error", "Category with following code already exist: " + code + "!");
                process.exit();
            }
            this.categories[code] = Category;
        });
        log("log", "Loading commands...");
        const commandsDirectory = await fs.readdir(process.cwd() + "/lib/commands");
        commandsDirectory.forEach(filename => {
            if (filename.startsWith("_"))
                return;
            const extension = fileExtension(filename);
            if (extension !== "js")
                return;
            const Command = require("../commands/" + filename);
            if (!Command.prototype instanceof BaseCommand)
                return;
            const code = Command.getCode();
            if (this.commands.hasOwnProperty(code)) {
                log("error", "Command with following code already available: " + code + "!");
                process.exit();
            }
            this.commands[code] = Command;
            log("log", `Command ${code} successfully loaded!`);
            if (!Command.aliasesAvailable())
                return;
            log("log", `Loading aliases for ${code}...`);
            const aliases = Command.getAliases();
            aliases.forEach(alias => {
                if (this.aliases.hasOwnProperty(alias)) {
                    log("error", `Warning! Alias ${alias} already used by command ${this.aliases[alias]}!`);
                    process.exit();
                }
                this.aliases[alias] = code;
                log("log", `Alias registered: ${alias} => ${code}.`);
            });
        });
    }

    /**
     * @param commandName
     * @return {boolean | CommandCallable}
     */
    static findCommand(commandName) {
        if (!this.commands.hasOwnProperty(commandName))
            return false;
        return this.commands[commandName];
    }
}

module.exports = CommandsRegistry;