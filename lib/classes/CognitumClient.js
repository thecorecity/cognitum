const Config = require("./ConfigManager.js");
const Lang = require("./localization/Lang.js");
const CommandsRegistry = require("./commands/CommandsRegistry.js");
const { Database } = require("./Database.js");
const { Client, MessageEmbed } = require("discord.js");
const MessageParser = require("./MessageParser.js");
const TasksQueue = require("./tasks/TasksQueue");
const MonitoringStatsTask = require("./tasks/internal/MonitoringStatsTask");
const { formatTimeString, log } = require("./Utils.js");
const VoiceStateManager = require("./statistics/VoiceStateManager");

/**
 * Extended class from Discord Client.
 */
class CognitumClient extends Client {
	/**
	 * Tasks queue.
	 * @type {TasksQueue}
	 */
	#tasksQueue;

	/**
	 * Voice stats manager instance.
	 * @type {VoiceStateManager}
	 */
	#voiceStatsManager;

	/**
	 * Main initialization command. Must be called on bot start.
	 * @return {Promise<void>}
	 */
	async initialize() {
		await Config.initialize();
		await Lang.initialize();
		await Database.initialize();
		await CommandsRegistry.initialize();
		await this.#initializeVoiceStateManager();
		this.#subscribeDiscordEvents();
		await this.login(
			Config.get("auth.discord.token")
		);
		log("log", "Authorization success!");
		await this.#initializeTasksQueue();
		this.#initializeInternalTasks();
		log("success", "All done!");
	}

	async #initializeTasksQueue() {
		this.#tasksQueue = new TasksQueue({
			discordClient: this
		});
		await this.#tasksQueue.initialize();
	}

	async #initializeVoiceStateManager() {
		this.#voiceStatsManager = new VoiceStateManager(this);
		await this.#voiceStatsManager.initialize();
	}

	#initializeInternalTasks() {
		this.#tasksQueue.pushTask(
			new MonitoringStatsTask(null, new Date().getTime())
		);
	}

	/**
	 * Bind required events to DiscordJS.
	 */
	#subscribeDiscordEvents() {
		this.on("message", this.#parseMessage);
	}

	/**
	 * Calling parser on new message.
	 * @param {module:"discord.js".Message} message Discord message.
	 * @return {Promise<void>}
	 */
	async #parseMessage(message) {
		try {
			const parser = new MessageParser(message);
			const result = await parser.run();
			await this.constructor.#handleCommandResult(message, result);
		} catch (e) {
			log("error", "MessageParser execution error!");
			console.error(e);
			await this.constructor.#handleCommandResult(message, ":warning: Unresolved MessageParser error!");
		}
	}

	/**
	 * Receiving result from called command.
	 * @param {module:"discord.js".Message} message Discord message.
	 * @param {*} result Any possible result, returned from command.
	 * @return {Promise<*>}
	 */
	static async #handleCommandResult(message, result) {
		try {
			if (result instanceof MessageEmbed)
				return await message.channel.send({ embed: result });
			if (typeof result === "string" && result.length > 0)
				return await message.channel.send(result);
		} catch (e) {
			log("error", "Failed to send command execution result!");
			console.error(e);
			return await message.channel.send(":warning: Unresolved command result handling error!");
		}
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

module.exports = CognitumClient;
