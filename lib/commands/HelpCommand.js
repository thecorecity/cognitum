const BaseCommand = require('./BaseCommand.js');
const BasicCategory = require('../categories/BasicCategory.js');
const CommandsRegistry = require('../classes/CommandsRegistry.js');

class HelpCommand extends BaseCommand {
    async run(params) {

    }
    static code = "help";
    static title = "commandHelp.title";
    static description = "commandHelp.description";
    static usage = this.code + " [command]";
    static aliases = ['halp', 'h'];
    static category = BasicCategory;
}

module.exports = HelpCommand;