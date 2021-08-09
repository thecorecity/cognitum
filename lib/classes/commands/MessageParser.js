const CommandsRegistry = require("./CommandsRegistry");
const BaseCommand = require("../base/BaseCommand");
const BaseError = require("../base/BaseError");
const CommandContext = require("./CommandContext");
const Lang = require("../localization/Lang");
const { GuildModel, GuildChannelModel, GuildMemberModel, UserModel, MessageStatisticsModel } = require("../Database");
const { createModuleLogger } = require("../Utils");
const logger = createModuleLogger("MessageParser");
const ConfigManager = require("../ConfigManager");

/**
 * # Message Parser
 *
 * Parser for incoming message. Finding commands calling, executing requested commands and returning data for replying.
 */
class MessageParser {
	/**
	 * Current message.
	 * @type {import("discord.js").Message}
	 */
	message;

	/**
	 * @param {import("discord.js").Message} message Discord message.
	 */
	constructor(message) {
		this.message = message;
	}

	/**
	 * Begin parsing process.
	 * @return {Promise<*|boolean>} Result of command execution or nothing if requested message not called any of
	 *     available commands.
	 */
	async resolve() {
		/** @type {Cognitum.ContextModelsInstances} */
		const databaseInstances = await this.#resolveInstancesWithStats();
		const prefix = databaseInstances.guild["prefix"] ?? ConfigManager.get("preferences.cognitum.prefix");
		const { status, commandName, args } = this.#parseContent({ prefix });
		if (!status)
			return;
		const TargetCommand = CommandsRegistry.findCommand(commandName);
		if (!(TargetCommand.prototype instanceof BaseCommand))
			return;
		const context = new CommandContext({
			message: this.message,
			prefix: prefix,
			args,
			language: new Lang(databaseInstances.guild["language"]),
			databaseInstances
		});
		try {
			/** @type {BaseCommand} */
			const command = new TargetCommand(context);
			await command.validate();
			return await command.run();
		} catch (error) {
			return this.constructor.#handleError(error, context);
		}
	}

	/**
	 * Creating tables entities at database for pushing statistics, pushing stats to text activity table.
	 * @return {Cognitum.ContextModelsInstances} Object with database instances.
	 * @todo Somehow check for tables elements existence to lower amount of queries sent to DB.
	 */
	async #resolveInstancesWithStats() {
		const databaseInstances = await this.#resolveInstances();
		try {
			await MessageStatisticsModel.create({
				id: this.message.id,
				id_member: databaseInstances.member.id,
				id_channel: this.message.channel.id,
				weight: this.#calculateScore(this.message.content)
			});
		} catch (error) {
			logger.error(`Failed to push statistics! Message ID: ${this.message.id}.`);
			console.dir(error);
		}
		return databaseInstances;
	};

	/**
	 * Resolving all database instances for context and statistics pushing.
	 * @return {Promise<Cognitum.ContextModelsInstances>}
	 */
	async #resolveInstances() {
		return this.constructor.resolveDatabaseInstances(this.message);
	};

	/**
	 * Calculate statistics score from content.
	 * @param {string} content Actual message content.
	 * @return {number} Calculated score.
	 */
	#calculateScore(content) {
		return content.match(this.constructor.wordRegex)?.length ?? 0;
	};

	/**
	 * Parse current message content.
	 * @param {Object} parseOptions Parsing options.
	 * @param {string} parseOptions.prefix Resolved for current guild prefix.
	 * @return {Cognitum.ContentParsingResult} Result of content parsing. If nothing found then returns status only.
	 */
	#parseContent({ prefix }) {
		if (!this.message.content.startsWith(prefix))
			return {
				status: false
			};
		const content = this.message.content.substr(prefix.length, this.message.content.length - prefix.length);
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
	 */
	static #handleError(error, context) {
		if (error instanceof BaseError)
			return error.toEmbed({ context });
		console.error(error);
		const unexpectedError = new BaseError(
			error instanceof Error && error.hasOwnProperty("message")
				? error.message
				: "Unexpected error has occurred!"
		);
		return unexpectedError.toEmbed({ context });
	};

	/**
	 * RegExp for calculating score from message content.
	 * @type {RegExp}
	 */
	static wordRegex = /[^\s\d!?.:,@<>/\\_]{3,}/g;

	/**
	 * Resolve all required database instances from target message.
	 * @param {import("discord.js").Message} message Target message.
	 * @return {Promise<Cognitum.ContextModelsInstances>} List of instances required for work.
	 */
	static async resolveDatabaseInstances(message) {
		const [guild] = await GuildModel.findOrCreate({
			where: { id: message.guild.id }
		});
		const [user] = await UserModel.findOrCreate({
			where: { id: message.author.id }
		});
		const [member] = await GuildMemberModel.findOrCreate({
			where: {
				id_guild: message.guild.id,
				id_user: message.author.id
			}
		});
		const [channel] = await GuildChannelModel.findOrCreate({
			where: {
				id: message.channel.id,
				id_guild: message.guild.id
			}
		});
		return { guild, user, member, channel };
	}
}

module.exports = MessageParser;
