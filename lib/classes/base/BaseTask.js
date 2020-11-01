const _ = require("lodash");
const { Task } = require("../Database");

/**
 * @interface
 */
class BaseTask {
	/**
	 * Unique ID of this task.
	 * @type {string|null}
	 */
	#id;

	/**
	 * Payload for task to run.
	 * @type {Object}
	 */
	#payload;

	/**
	 * Time for task execution.
	 * @type {number}
	 */
	#time;

	/**
	 * @param {Object|JSON} payload A payload for current task. Must be JSON or Object.
	 * @param {number|Date} timestamp Timestamp of actual date and time for task execution.
	 * @param {string|null} [id=null] Unique task ID. If not set, new task instance in database will be created.
	 */
	constructor(payload, timestamp, id = null) {
		if (timestamp instanceof Date)
			timestamp = timestamp.getTime();
		this.#time = timestamp;
		if (typeof payload === "string")
			return this.#payload = JSON.parse(payload);
		this.#payload = _.cloneDeep(payload);
	}

	/**
	 * Actions before run.
	 * @property {Cognitum.TaskQueueRunOptions} options
	 * @return {Promise<any>}
	 */
	// eslint-disable-next-line no-unused-vars
	async beforeRun(options) {
		return void(0);
	}

	/**
	 * Method for running
	 * @property {Cognitum.TaskQueueRunOptions} options
	 * @return {Promise<any>}
	 * @abstract
	 */
	// eslint-disable-next-line no-unused-vars
	async run(options) {
		throw new Error("Task not implemented!");
	}

	/**
	 * Actions after run.
	 * @property {Cognitum.TaskQueueRunOptions} options
	 * @return {Promise<any>}
	 */
	// eslint-disable-next-line no-unused-vars
	async afterRun(options) {
		return void(0);
	}

	async initialize() {
		if (!this.constructor.save)
			return;
		if (!this.#id) {
			const task = await Task.create({
				code: this.constructor.code,
				payload: JSON.stringify(this.#payload),
				time: "asdasd"
			});
			this.#id = task["id"];
		}
	}

	/**
	 * Get ID of current task.
	 * @return {string|null}
	 */
	get id() {
		return this.#id;
	}

	/**
	 * Getter for execution time.
	 * @return {number} Task execution time in timestamp.
	 */
	get time() {
		return this.#time;
	}

	/**
	 * Getter for task payload.
	 * @return {JSON|Object} Clone of original payload content.
	 */
	get payload() {
		return this.#payload;
	}

	static name = "BaseTask";
	static code = "base";
	static save = false;

	/**
	 * Function for converting task to JSON string for saving tasks in database.
	 * @return {string}
	 */
	toString() {
		return JSON.stringify({
			code: this.constructor.code,
			payload: this.#payload,
			time: this.#time
		});
	}
}

module.exports = BaseTask;
