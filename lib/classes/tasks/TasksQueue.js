const TaskLoader = require("./TaskLoader");
const { TaskModel } = require("../Database");
const { EventEmitter } = require("events");
const BaseTask = require("../base/BaseTask");
const BaseDiscordModule = require("../base/BaseDiscordModule");
const { Op } = require("sequelize");
const { createModuleLogger } = require("../Utils");
const logger = createModuleLogger("taskQueue");

/**
 * Queue
 */
class TasksQueue extends BaseDiscordModule {
	/** @type {BaseTask[]} */
	#tasksList = [];

	/**
	 * Current timer id for stopping.
	 * @type {Object}
	 */
	#currentTimer;

	/**
	 * Timestamp for current timer. Used to prevent additional timer restarting.
	 * @type {number}
	 */
	#currentTimerTimestamp;

	/**
	 * EventEmitter for internal events.
	 */
	#emitter = new EventEmitter();

	/**
	 * Initialize current tasks queue.
	 * @return {Promise<TasksQueue>}
	 */
	async initialize() {
		logger.info("Initializing tasks queue...");
		this.#subscribeInternalEvents();
		await this.#loadTasksFromDatabase();
		this.#updateTimer();
		logger.info("Initialization completed.");
		return this;
	}

	#subscribeInternalEvents() {
		this.#emitter.on(this.constructor.#EVENT_TASK_ADDED, async task => {
			await this.#handleNewTask(task);
		});
	}

	/**
	 * Handle new task added.
	 * @param {BaseTask} task
	 */
	async #handleNewTask(task) {
		logger.debug(`Task pushed: code=${task.constructor.code}.`);
		await task.initialize();
		this.#tasksList.push(task);
		if (task.time < this.#currentTimerTimestamp || !this.#currentTimerTimestamp) {
			logger.debug("Timer update required!");
			this.#updateTimer(task);
		}
	}

	/**
	 * Update current timer.
	 * @param {BaseTask} [task] Forced target task for new timer.
	 */
	#updateTimer(task) {
		clearTimeout(this.#currentTimer);
		const now = new Date().getTime();
		let nextTimerTime = task?.time ?? -1;
		if (nextTimerTime < 0) {
			this.#tasksList.forEach(task => {
				if (nextTimerTime < 0) {
					nextTimerTime = task.time;
					return;
				}
				nextTimerTime = Math.min(nextTimerTime, task.time);
			});
		}
		logger.debug(`Updating timer to ${nextTimerTime}.`);
		if (nextTimerTime < 0)
			return;
		nextTimerTime = Math.max(now, nextTimerTime) - now;
		if (nextTimerTime >= this.constructor.#MAX_TIMER_TIME)
			nextTimerTime = this.constructor.#MAX_TIMER_TIME;
		this.#currentTimerTimestamp = now + nextTimerTime;
		this.#currentTimer = setTimeout(async () => {
			await this.#runTasks();
			this.#updateTimer();
		}, nextTimerTime);
	}

	/**
	 * Run tasks from queue.
	 * @return {Promise<void>}
	 */
	async #runTasks() {
		const now = new Date().getTime();
		const callArguments = {
			discordClient: this.client
		};
		const completedTasks = [];
		// Searching for tasks to complete.
		for (let i = 0; i < this.#tasksList.length; i++) {
			let task = this.#tasksList[i];
			// Skip non-task elements
			if (!(task instanceof BaseTask))
				continue;
			if (task.time < now) {
				await task.beforeRun(callArguments);
				await task.run(callArguments);
				await task.afterRun(callArguments);
				if (task.id) {
					completedTasks.push(task.id);
				}
				delete this.#tasksList[i];
			}
		}
		// Clearing removed or incorrect tasks from queue.
		this.#tasksList = this.#tasksList.filter(task => task instanceof BaseTask);
		// Close saved tasks in database.
		if (completedTasks.length) {
			await TaskModel.update({
				completed: 1
			}, {
				where: {
					id: {
						[Op.or]: completedTasks
					}
				}
			});
		}
	}

	/**
	 * Load all uncompleted tasks from database.
	 * @return {Promise<void>}
	 */
	async #loadTasksFromDatabase() {
		logger.info("Loading tasks from database...");
		/** @type TaskModel[] */
		const tasks = await TaskModel.findAll({
			where: {
				completed: 0
			}
		});
		logger.debug(`Pending tasks found in database: ${tasks?.length}.`);
		tasks.forEach(taskInstance => {
			this.#tasksList.push(
				TaskLoader.resolveTask(taskInstance)
			);
		});
	};

	/**
	 * Push new task.
	 * @param {BaseTask} task
	 */
	pushTask(task) {
		if (!(task instanceof BaseTask))
			return;
		this.#emitter.emit(this.constructor.#EVENT_TASK_ADDED, task);
	}

	static #EVENT_TASK_ADDED = "taskAdded";
	static #MAX_TIMER_TIME = 864000000;
}

module.exports = TasksQueue;
