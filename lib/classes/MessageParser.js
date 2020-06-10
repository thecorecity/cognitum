const CommandsRegistry = require('./CommandsRegistry.js');
const {Guild} = require('./Database.js');

class MessageParser {
    /**
     * @type {Message}
     */
    message;
    prefix;
    command;
    params;

    /**
     * @param {Message} message
     */
    constructor(message) {
        this.message = message;
    }

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
        if (!TargetCommand)
            return;
        const command = new TargetCommand({
            args,
            message
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