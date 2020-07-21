const CommandsRegistry = require("./CommandsRegistry.js");
const BaseCommand = require("../commands/BaseCommand.js");
const BaseError = require("../classes/errors/BaseError.js");
const CommandContext = require("./CommandContext.js");
const Lang = require("./Lang.js");
const { Guild } = require("./Database.js");

/**
 * # Message Parser
 *
 * Parser for incoming message. Finding commands calling, executing requested commands and returning data for replying.
 */
class MessageParser {
	/**
	 * Current message.
	 * @type {Message}
	 */
	message;

	/**
	 * Current prefix.
	 * @type {string}
	 */
	prefix;

	/**
	 * Current command.
	 * @type {string}
	 */
	command;

	/**
	 * Current parameters.
	 * @type {Object}
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
	 * @return {Promise<*|boolean>} Result of command execution or nothing if requested message not called any of
	 *     available commands.
	 */
	async run() {
		this.prefix = await Guild.resolvePrefix(this.message.guild.id);
		const {
			status,
			commandName,
			args
		} = this.#parseContent({
			message: this.message,
			prefix: this.prefix
		});
		if (!status)
			return;
		const TargetCommand = CommandsRegistry.findCommand(commandName);
		if (!(TargetCommand.prototype instanceof BaseCommand))
			return;
		const context = new CommandContext({
			message: this.message,
			prefix: this.prefix,
			args,
			language: new Lang("en")
		});
		try {
			const command = new TargetCommand(context);
			await command.validate();
			return await command.run();
		} catch (error) {
			return this.#handleError(error, context);
		}
	}

	/**
	 * Parse current message content.
	 * @param {Object} parseOptions Parsing options.
	 * @param {Message} parseOptions.message Actual DiscordJS message.
	 * @param {string} parseOptions.prefix Resolved for current guild prefix.
	 * @return {ContentParsingResult} Result of content parsing. If nothing found then returns status only.
	 */
	#parseContent = function ({ message, prefix }) {
		if (!message.content.startsWith(prefix))
			return {
				status: false
			};
		const content = message.content.substr(prefix.length, message.content.length - prefix.length);
		const commandParts = content.split(/\s+/);
		const command = commandParts.shift().toLowerCase();
		return {
			status: true,
			commandName: command,
			args: commandParts
		};
	};

	/**
	 * Handle error occurred on command validation or execution.
	 * @param {BaseError | Error} error Error class.
	 * @param {CommandContext} context Command context for showing error for current command execution.
	 */
	#handleError = function (error, context) {
		if (error instanceof BaseError)
			return error.toEmbed({ context });
	};
}

/**
 * Result of parseContent method. Contains status, command name and arguments requested in selected message. If status
 * is negative, then command name and arguments is not set.
 *
 * @typedef {{status: boolean, commandName?: string, args?: string[]}} ContentParsingResult
 */

module.exports = MessageParser;
