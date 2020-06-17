const BaseCommand = require('./BaseCommand.js');
const CommandsRegistry = require('../classes/CommandsRegistry.js');
const CoreCategory = require('../categories/CoreCategory.js');
const DefaultEmbed = require('../classes/embed/DefaultEmbed.js');
const Lang = require('../classes/Lang.js');

class HelpCommand extends BaseCommand {
    // TODO Select language by guild for help command
    lang = new Lang('en');

    async run() {
        if (this.args.length === 1)
            return await this.generateCommandInfo(this.args[0]);
        return await this.generateCommandsList();
    }

    static code = "help";
    static usage = this.code + " [command]";
    static aliases = ['halp', 'h'];
    static category = CoreCategory;

    async generateCommandsList() {
        const response = new DefaultEmbed(this.message, "guild");
        const map = CommandsRegistry.getCommandsMap();
        for (const categoryName in map) {
            if (!map.hasOwnProperty(categoryName))
                continue;
            const CurrentCategory = CommandsRegistry.findCategory(categoryName);
            response.addField(this.lang.get())
        }
    }

    async generateCommandInfo(commandName) {

    }
}

module.exports = HelpCommand;