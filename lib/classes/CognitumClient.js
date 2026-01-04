import ConfigManager from "./ConfigManager";
import Lang from "./localization/Lang";
import CommandsRegistry from "./commands/CommandsRegistry";
import { Database } from "./Database";
import { Client } from "discord.js";
import TasksQueue from "./tasks/TasksQueue";
import MonitoringStatsTask from "./tasks/internal/MonitoringStatsTask";
import { formatTimeString, logger } from "./Utils";
import VoiceStateManager from "./statistics/VoiceStateManager";
import MessageProcessor from "./MessageProcessor";
import LogsProcessor from "./LogsProcessor";
import NicknamesProcessor from "./nicknames/NicknamesProcessor";

const discordAuth = new ConfigManager("auth.discord");

/**
 * Extended class from Discord Client.
 */
export default class CognitumClient extends Client {
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

	/**
	 * @return {VoiceStateManager}
	 */
	get voiceStatsManager() {
		return this.#voiceStatsManager;
	}
}
