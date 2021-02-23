const ConfigManager = require("./ConfigManager");
const Lang = require("./localization/Lang");
const CommandsRegistry = require("./commands/CommandsRegistry");
const { Database } = require("./Database");
const { Client } = require("discord.js");
const TasksQueue = require("./tasks/TasksQueue");
const MonitoringStatsTask = require("./tasks/internal/MonitoringStatsTask");
const { formatTimeString, logger } = require("./Utils");
const VoiceStateManager = require("./statistics/VoiceStateManager");
const MessageProcessor = require("./MessageProcessor");
const LogsProcessor = require("./LogsProcessor");
const NicknamesProcessor = require("./nicknames/NicknamesProcessor");

const discordAuth = new ConfigManager("auth.discord");

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
	 * Logs processor instance.
	 * @type {LogsProcessor}
	 */
	#logsProcessor;

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
		await ConfigManager.initialize();
		await Lang.initialize();
		await Database.initialize();
		await CommandsRegistry.initialize();
		this.#voiceStatsManager = await new VoiceStateManager(this).initialize();
		await new MessageProcessor(this).initialize();
		this.#logsProcessor = await new LogsProcessor(this).initialize();
		await new NicknamesProcessor(this).initialize();
		await this.login(discordAuth.get("token"));
		logger.info("Discord authorization success!");
		this.#tasksQueue = await new TasksQueue(this).initialize();
		this.#initializeInternalTasks();
		logger.info("Initialization completed.");
	}

	/**
	 * Initialize internal tasks required by bot.
	 */
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

	/**
	 * Task queue instance. May be used for pushing tasks.
	 * @return {TasksQueue}
	 */
	get taskQueue() {
		return this.#tasksQueue;
	}

	/**
	 * Logs processor instance.
	 * @return {LogsProcessor}
	 */
	get logsProcessor() {
		return this.#logsProcessor;
	}
}

module.exports = CognitumClient;
