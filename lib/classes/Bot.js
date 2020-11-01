const Config = require("./ConfigManager.js");

const Lang = require("./Lang.js");
const CommandsRegistry = require("./CommandsRegistry.js");
const { Database } = require("./Database.js");
const { Client, MessageEmbed } = require("discord.js");
const MessageParser = require("./MessageParser.js");
const TasksQueue = require("./tasks/TasksQueue");
const { formatTimeString, log } = require("./Utils.js");

/**
 * Extended class from Discord Client.
 */
class Bot extends Client {
	/**
	 * Tasks queue.
	 * @type {TasksQueue}
	 */
	#tasksQueue;

	/**
	 * Main initialization command. Must be called on bot start.
	 * @return {Promise<void>}
	 */
	async initialize() {
		await Config.initialize();
		await Lang.initialize();
		await Database.initialize();
		await CommandsRegistry.initialize();
		this.subscribeDiscordEvents();
		await this.login(
			Config.get("auth.discord.token")
		);
		log("log", "Authorization success!");
		await this.initializeTasksQueue();
	}

	async initializeTasksQueue() {
		this.#tasksQueue = new TasksQueue({
			discordClient: this
		});
		await this.#tasksQueue.initialize();
	}

	/**
	 * Bind required events to DiscordJS.
	 */
	subscribeDiscordEvents() {
		this.on("message", this.parseMessage);
	}

	/**
	 * Calling parser on new message.
	 * @param {Message} message Discord message.
	 * @return {Promise<void>}
	 */
	async parseMessage(message) {
		const parser = new MessageParser(message);
		const result = await parser.run();
		await this.handleCommandResult(message, result);
	}

	/**
	 * Receiving result from called command.
	 * @param {Message} message Discord message.
	 * @param {*} result Any possible result, returned from command.
	 * @return {Promise<*>}
	 */
	async handleCommandResult(message, result) {
		if (result instanceof MessageEmbed)
			return await message.channel.send({ embed: result });
		if (typeof result === "string" && result.length > 0)
			return await message.channel.send(result);
	}

	/**
	 * Get current bot process uptime in formatted string.
	 * @return {string} String with current bot uptime.
	 */
	static getUptimeString() {
		return formatTimeString(
			process.uptime()
		);
	}

	get taskQueue() {
		return this.#tasksQueue;
	}
}

module.exports = Bot;
