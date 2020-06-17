const CommandsRegistry = require('./CommandsRegistry.js');
const BaseCommand = require("../commands/BaseCommand");
const {Guild} = require('./Database.js');

class MessageParser {
    /**
     * @type {Message} Current message.
     */
    message;

    /**
     * @type {string} Current prefix.
     */
    prefix;

    /**
     * @type {string} Current command.
     */
    command;

    /**
     * @type {Object} Current parameters.
     */
    params;

    /**
     * @param {Message} message Discord message.
     */
    constructor(message) {
        this.message = message;
    }

    /**
     * Begin parsing process.
     * @return {Promise<*|boolean>}
     */
    async run() {
        this.prefix = await Guild.resolvePrefix(this.message.guild.id);
        const {
            status = false,
            commandName = null,
            args = null
        } = this.#parseContent({
            message: this.message,
            prefix: this.prefix
        });
        if (!status)
            return;
        const TargetCommand = CommandsRegistry.findCommand(commandName);
        if (!TargetCommand instanceof BaseCommand)
            return;
        const command = new TargetCommand({
            args,
            message: this.message
        });
        return await command.run();
    }

    /**
     * @param {Object} message
     * @param {String} prefix
     */
    #parseContent = function ({message, prefix}) {
        if (!message.content.startsWith(prefix))
            return {
                status: false
            };
        const content = message.content.substr(prefix.length + 1, message.content.length - prefix.length);
        const commandParts = content.split(/\s+/);
        const command = commandParts.shift().toLowerCase();
        return {
            status: true,
            commandName: command,
            args: commandParts
        }
    }
}

module.exports = MessageParser;