const ReminderTask = require("./commands/ReminderTask.js");
const BaseTask = require("../base/BaseTask.js");

class TaskLoader {
	static #tasks = {
		[ReminderTask.code]: ReminderTask
	};

	/**
	 * Resolve command from database record.
	 *
	 * @param {Task} taskInstance Instance of task from database.
	 * @return {BaseTask} Initialized task object.
	 * @throws {Error} If command is not resolved by task code.
	 */
	static resolveTask(taskInstance) {
		const TaskClass = this.#tasks[taskInstance["code"]] ?? null;
		if (!TaskClass || !(TaskClass instanceof BaseTask))
			throw new Error(`Failed to load unregistered task: ${taskInstance["code"]}!`);
		return new TaskClass({}, taskInstance["time"], taskInstance["id"]);
	}
}

module.exports = TaskLoader;
