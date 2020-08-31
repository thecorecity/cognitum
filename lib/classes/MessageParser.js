const CommandsRegistry = require("./CommandsRegistry.js");
const BaseCommand = require("../commands/BaseCommand.js");
const BaseError = require("../classes/errors/BaseError.js");
const CommandContext = require("./CommandContext.js");
const Lang = require("./Lang.js");
const { Guild, GuildChannel, GuildMember, User, MessageStatistics } = require("./Database.js");
const { createModuleLog } = require("./Utils.js");
const log = createModuleLog("MessageParser");
const ConfigManager = require("./ConfigManager.js");

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
		/** @type {Cognitum.ContextModelsInstances} */
		let databaseInstances;
		try {
			databaseInstances = await this.#pushStatistics(this.message);
		} catch (error) {
			log("error", `Failed to push statistics! Message ID: ${this.message.id}.`);
			console.dir(error);
			databaseInstances = await this.#resolveInstances(this.message);
		}
		const { status, commandName, args } = this.#parseContent({
			message: this.message,
			prefix: databaseInstances.guild.prefix ?? ConfigManager.get("preferences.cognitum.prefix")
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
			language: new Lang("en"),
			databaseInstances
		});
		try {
			/** @type {BaseCommand} */
			const command = new TargetCommand(context);
			await command.validate();
			return await command.run();
		} catch (error) {
			return this.#handleError(error, context);
		}
	}

	/**
	 * Creating tables entities at database for pushing statistics, pushing stats to text activity table.
	 * @param {Message} message Discord JS message object.
	 * @return {Cognitum.ContextModelsInstances} Object with database instances.
	 *
	 * @todo Somehow check for tables elements existence to lower amount of queries sent to DB.
	 * @this MessageParser
	 */
	#pushStatistics = async function (message) {
		const databaseInstances = await this.#resolveInstances(message);
		await MessageStatistics.create({
			id: message.id,
			id_member: databaseInstances.member.id,
			id_channel: message.channel.id,
			weight: this.#calculateScore(message.content)
		});
		return databaseInstances;
	};

	/**
	 * Resolving all database instances for context and statistics pushing.
	 *
	 * @param {Message} message Discord message instance for resolving database instances.
	 * @return {Promise<Cognitum.ContextModelsInstances>}
	 * @this MessageParser
	 */
	#resolveInstances = async function (message) {
		const [guild] = await Guild.findOrCreate({
			where: { id: message.guild.id }
		});
		const [user] = await User.findOrCreate({
			where: { id: message.author.id }
		});
		const [member] = await GuildMember.findOrCreate({
			where: {
				id_guild: message.guild.id,
				id_user: message.author.id
			}
		});
		const [channel] = await GuildChannel.findOrCreate({
			where: {
				id: message.channel.id,
				id_guild: message.guild.id
			}
		});
		return {
			guild,
			user,
			member,
			channel
		};
	};

	/**
	 * Calculate statistics score from content.
	 * @param {string} content Actual message content.
	 * @return {number} Calculated score.
	 * @this MessageParser
	 */
	#calculateScore = function (content) {
		return content.match(this.constructor.wordRegex)?.length ?? 0;
	};

	/**
	 * Parse current message content.
	 * @param {Object} parseOptions Parsing options.
	 * @param {Message} parseOptions.message Actual DiscordJS message.
	 * @param {string} parseOptions.prefix Resolved for current guild prefix.
	 * @return {Cognitum.ContentParsingResult} Result of content parsing. If nothing found then returns status only.
	 * @this MessageParser
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
	 * @return {void | DefaultEmbed} Object of DefaultEmbed class to show this error or nothing if embed generating is
	 * not possible.
	 * @this MessageParser
	 */
	#handleError = function (error, context) {
		if (error instanceof BaseError)
			return error.toEmbed({ context });
		console.error(error);
		const unexpectedError = new BaseError("Unexpected error occurred!");
		return unexpectedError.toEmbed({ context });
	};

	/**
	 * RegExp for calculating score from message content.
	 * @type {RegExp}
	 */
	static wordRegex = /[^\s\d!?.:,@<>/\\_]{3,}/g;
}

module.exports = MessageParser;
