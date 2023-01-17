const CommandsRegistry = require("./CommandsRegistry");
const BaseCommand = require("../base/commands/BaseCommand");
const BaseError = require("../base/errors/BaseError");
const CommandContext = require("./CommandContext");
const Lang = require("../localization/Lang");
const { GuildModel, GuildChannelModel, GuildMemberModel, UserModel, MessageStatisticsModel } = require("../Database");
const { createModuleLogger } = require("../Utils");
const logger = createModuleLogger("MessageParser");
const ConfigManager = require("../ConfigManager");
const { ChannelType } = require("discord-api-types/v10");
const BaseStringableError = require("../base/errors/BaseStringableError");

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
		/** @type {ContextModelsInstances} */
		const databaseInstances = await this.#resolveInstancesWithStats();
		const prefix = databaseInstances.guild.prefix ?? ConfigManager.get("preferences.cognitum.prefix");
		const { status, commandName, args } = this.#parseCommandFromContent({ prefix });

		if (!status)
			return;

		const TargetCommand = CommandsRegistry.findCommand(commandName);

		if (!(TargetCommand.prototype instanceof BaseCommand))
			return;

		const context = new CommandContext({
			message: this.message,
			prefix,
			args,
			language: new Lang(databaseInstances.guild.language),
			databaseInstances
		});

		try {
			/** @type {BaseCommand} */
			const command = new TargetCommand(context);
			await command.validate();
			return await command.run();
		} catch (error) {
			return MessageParser.#onError(error, context);
		}
	}

	/**
	 * Creating tables entities at database for pushing statistics, pushing stats to text activity table.
	 * @return {ContextModelsInstances} Object with database instances.
	 * @todo Somehow check for tables elements existence to lower amount of queries sent to DB.
	 */
	async #resolveInstancesWithStats() {
		const databaseInstances = await this.#resolveInstances();

		await MessageParser.calculateAndStoreStatistics(this.message, databaseInstances);

		return databaseInstances;
	};

	/**
	 * Resolving all database instances for context and statistics pushing.
	 * @return {Promise<ContextModelsInstances>}
	 */
	async #resolveInstances() {
		return MessageParser.#resolveDatabaseInstances(this.message);
	};

	/**
	 * Calculate statistics score from content.
	 * @param {string} content Actual message content.
	 * @return {number} Calculated score.
	 */
	static #calculateScore(content) {
		return content.match(MessageParser.wordRegex)?.length ?? 0;
	};

	/**
	 * Parse current message content.
	 * @param {Object} parseOptions Parsing options.
	 * @param {string} parseOptions.prefix Resolved for current guild prefix.
	 * @return {Cognitum.ContentParsingResult} Result of content parsing. If nothing found then returns status only.
	 */
	#parseCommandFromContent({ prefix }) {
		let content = this.message.content;

		if (!content.startsWith(prefix))
			return {
				status: false
			};

		content = content.substring(prefix.length, content.length);

		const args = content.split(/\s+/);
		const commandName = args.shift().toLowerCase();

		return {
			status: true,
			commandName,
			args
		};
	};

	/**
	 * Handle error occurred on command validation or execution.
	 * @param {BaseError | Error} error Error class.
	 * @param {CommandContext} context Command context for showing error for current command execution.
	 * @return {void | DefaultEmbed | string} Object of DefaultEmbed class to show this error or nothing if embed generating is
	 * not possible.
	 */
	static #onError(error, context) {
		if (error instanceof BaseError)
			return error.toEmbed({ context });

		if (error instanceof BaseStringableError)
			return error.toString();

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
	 * @param {Partial<{channel: string, guild: string, user: string }>|null} ids (Optional) List of the ID overrides.
	 * @return {Promise<ContextModelsInstances>} List of instances required for work.
	 */
	static async #resolveDatabaseInstances(message, ids = null) {
		let {
			channel: { id: channelId },
			guild: { id: guildId },
			author: { id: userId }
		} = message;

		ids ??= {};
		ids.guild ??= guildId;
		ids.channel ??= channelId;
		ids.user ??= userId;

		const [guild] = await GuildModel.findOrCreate({
			where: { id: ids.guild }
		});

		const [user] = await UserModel.findOrCreate({
			where: { id: ids.user }
		});

		const [member] = await GuildMemberModel.findOrCreate({
			where: {
				id_guild: ids.guild,
				id_user: ids.user
			}
		});

		const [channel] = await GuildChannelModel.findOrCreate({
			where: {
				id: ids.channel,
				id_guild: ids.guild
			}
		});

		return { guild, user, member, channel };
	}

	/**
	 * Calculate and store statistics for current message. Channel type will be checked inside.
	 * @param {import('discord.js').Message} message Target message object.
	 * @param {ContextModelsInstances|null} databaseInstances (Optional) Already resolved database instances. If not
	 * present, database instances will be requested from the database.
	 * @returns {Promise<void>}
	 */
	static async calculateAndStoreStatistics(message, databaseInstances = null) {
		const { /** @type {import('discord.js').GuildChannel} */ channel } = message;
		let targetChannelId = channel.id;

		// For threads, use parent channel ID.
		if (channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread) {
			targetChannelId = channel.parentId;

			// If parent channel is found and there are database instances present, we should not track anything to prevent
			// possible database errors.
			if (databaseInstances) {
				console.error("Database instances should not be passed when calculating statistics for threads! This might cause incorrect statistics!");
				return;
			}
		}

		// If database instances are not provided, resolve them.
		if (databaseInstances === null)
			databaseInstances = await MessageParser.#resolveDatabaseInstances(message, { channel: targetChannelId });

		// Only process message statistics if user is trackable.
		if (!databaseInstances.user.trackable) {
			return;
		}

		// Add message statistics to database.
		try {
			await MessageStatisticsModel.create({
				id: message.id,
				id_member: databaseInstances.member.id,
				id_channel: targetChannelId,
				weight: this.#calculateScore(message.content)
			});
		} catch (error) {
			logger.error(`Failed to push statistics! Message ID: ${message.id}.`);
			console.dir(error);
		}
	}
}

module.exports = MessageParser;
