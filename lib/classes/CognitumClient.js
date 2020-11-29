const Config = require("./ConfigManager");
const Lang = require("./localization/Lang");
const CommandsRegistry = require("./commands/CommandsRegistry");
const { Database } = require("./Database");
const { Client } = require("discord.js");
const TasksQueue = require("./tasks/TasksQueue");
const MonitoringStatsTask = require("./tasks/internal/MonitoringStatsTask");
const { formatTimeString, log } = require("./Utils");
const VoiceStateManager = require("./statistics/VoiceStateManager");
const MessageProcessor = require("./MessageProcessor");
const LogsProcessor = require("./LogsProcessor");

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
		this.#voiceStatsManager = await new VoiceStateManager(this).initialize();
		await new MessageProcessor(this).initialize();
		await new LogsProcessor(this).initialize();
		await this.login(
			Config.get("auth.discord.token")
		);
		log("log", "Authorization success!");
		this.#tasksQueue = await new TasksQueue(this).initialize();
		this.#initializeInternalTasks();
		log("success", "All done!");
	}

	#initializeInternalTasks() {
		this.#tasksQueue.pushTask(
			new MonitoringStatsTask(null, new Date().getTime())
		);
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
