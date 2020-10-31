const _ = require("lodash");

class BaseTask {
	/**
	 * Payload for task to run.
	 * @type {JSON|Object}
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
	 */
	constructor(payload, timestamp) {
		if (timestamp instanceof Date)
			timestamp = timestamp.getTime();
		this.#time = timestamp;
		if (typeof payload === "string")
			return this.#payload = JSON.parse(payload);
		this.#payload = _.cloneDeep(payload);
	}

	/**
	 * Method for running
	 * @return {Promise<void>}
	 * @abstract
	 */
	async run() {
		throw new Error("Task not implemented!");
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
