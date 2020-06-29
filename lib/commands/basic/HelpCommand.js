const BaseCommand = require('../BaseCommand.js');
const CommandsRegistry = require('../../classes/CommandsRegistry.js');
const CoreCategory = require('../../categories/CoreCategory.js');
const DefaultEmbed = require('../../classes/embed/DefaultEmbed.js');
const ErrorEmbed = require("../../classes/embed/ErrorEmbed.js");

class HelpCommand extends BaseCommand {
    async run() {
        if (this.args.length === 1)
            return await this.generateCommandInfo(this.args[0]);
        return await this.generateCommandsList();
    }

    static code = "help";
    static usage = this.code + " [command]";
    static aliases = ['halp', 'h'];
    static category = CoreCategory.getCode();

    async generateCommandsList() {
        const response = new DefaultEmbed(this.message, "self")
            .setTitle(
                this.resolveLang('command.help.commandsList')
            );
        delete response.description;
        const map = CommandsRegistry.getCommandsMap();
        for (const categoryName in map) {
            if (!map.hasOwnProperty(categoryName))
                continue;
            const CurrentCategory = CommandsRegistry.findCategory(categoryName);
            response.addField(
                this.resolveLang(
                    CurrentCategory.getTitle()
                ),
                "`" + map[categoryName].join("` `") + "`"
            )
        }
        return response;
    }

    async generateCommandInfo(commandName) {
        const CommandClass = CommandsRegistry.findCommand(commandName);
        if (!CommandClass || !CommandClass.prototype instanceof BaseCommand) {
            return new ErrorEmbed(this.message, "self")
                .setTitle(
                    this.resolveLang('embed.errors.commandNotFound.title', {
                        commandName
                    })
                )
                .setDescription(
                    this.resolveLang('embed.errors.commandNotFound.description', {
                        // TODO Make access to prefix for commands or resolve prefix from Guild instance
                        prefix: "c!"
                    })
                );
        }
        return new DefaultEmbed(this.message, "self")
            .setTitle(
                this.resolveLang(
                    CommandClass.getTitle()
                )
            )
            .setDescription(
                this.resolveLang(
                    CommandClass.getDescription()
                )
            )
    }
}

module.exports = HelpCommand;
