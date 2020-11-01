const TaskLoader = require("./TaskLoader.js");
const { Task } = require("../Database.js");
const { EventEmitter } = require("events");
const BaseTask = require("../base/BaseTask.js");
const { Op } = require("sequelize");

/**
 * Queue
 */
class TasksQueue {
	/** @type {BaseTask[]} */
	#tasksList = [];
	#currentTimer;
	#currentTimerTimestamp;
	#emitter = new EventEmitter();
	/** @type {Bot} */
	#discordClient;

	/**
	 * @param {Object} options List of options for queue.
	 * @param {Bot} options.discordClient Discord client instance.
	 */
	constructor({ discordClient }) {
		this.#discordClient = discordClient;
	}

	/**
	 * Initialize current tasks queue.
	 * @return {Promise<void>}
	 */
	async initialize() {
		this.#subscribeEvents();
		await this.#loadTasksFromDatabase();
		this.#updateTimer();
	}

	#subscribeEvents() {
		this.#emitter.on(this.constructor.#EVENT_TASK_ADDED, task => {
			this.#handleNewTask(task);
		});
	}

	/**
	 * Handle new task added.
	 * @param {BaseTask} task
	 */
	#handleNewTask(task) {
		this.#tasksList.push(task);
		if (task.time < this.#currentTimerTimestamp || !this.#currentTimerTimestamp)
			this.#updateTimer(task);
	}

	/**
	 * Update current timer.
	 * @param {BaseTask} [task] Forced target task for new timer.
	 */
	#updateTimer(task) {
		clearTimeout(this.#currentTimer);
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
		if (nextTimerTime < 0)
			return;
		this.#currentTimer = setTimeout(async () => {
			await this.#runTasks();
			this.#updateTimer();
		});
	}

	/**
	 * Run tasks from queue.
	 * @return {Promise<void>}
	 */
	async #runTasks() {
		const now = new Date().getTime();
		const callArguments = {
			discordClient: this.#discordClient
		};
		const completedTasks = [];
		// Searching for tasks to complete.
		for (let i = 0; i < this.#tasksList.length; i++){
			let task = this.#tasksList[i];
			if (task.time < now) {
				await task.beforeRun(callArguments);
				await task.run(callArguments);
				await task.afterRun(callArguments);
				if (task.id) {
					completedTasks.push(task.id);
				}
			}
		}
		// Close saved tasks in database.
		await Task.update({
			completed: 1
		}, {
			where: {
				id: {
					[Op.or]: completedTasks
				}
			}
		});
	}

	/**
	 * Load all uncompleted tasks from database.
	 * @return {Promise<void>}
	 */
	async #loadTasksFromDatabase() {
		/** @type Task[] */
		const tasks = await Task.findAll({
			where: {
				completed: 0
			}
		});
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
}

module.exports = TasksQueue;
