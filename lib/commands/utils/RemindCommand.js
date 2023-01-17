const BaseCommand = require("../../classes/base/commands/BaseCommand");
const UtilsCategory = require("../../categories/UtilsCategory");
const TimeStringError = require("../../classes/errors/TimeStringError");
const ReminderTask = require("../../classes/tasks/commands/ReminderTask");
const TimeString = require("../../classes/content/TimeString");
const { escapeMarkdown } = require("../../classes/Utils");

class RemindCommand extends BaseCommand {
	async run() {
		const timeString = new TimeString(this.args.pop());
		const seconds = timeString.toSeconds();

		if (seconds === 0)
			throw new TimeStringError("zeroTime");

		const message = this.args.join(" ");

		this.#createReminderTask(message, seconds);
		return this.#createSuccessMessage(message, timeString);
	}

	/**
	 * Push reminder task to tasks queue.
	 * @param {string} [message] Reminder message.
	 * @param {number} time Time in seconds for reminder for future execution.
	 */
	#createReminderTask(message, time) {
		// noinspection JSValidateTypes
		/** @type {CognitumClient} */
		const client = this.message.client;
		client.taskQueue.pushTask(
			new ReminderTask({
				message,
				userId: this.message.author.id
			}, new Date().getTime() + time * 1000)
		);
	}

	/**
	 * Generate message for reply.
	 * @param {string} message Reminder message.
	 * @param {TimeString} time Number of seconds.
	 * @return {string} Message for replying.
	 */
	#createSuccessMessage(message, time) {
		return this.resolveLang("command.remind.successful", {
			message: escapeMarkdown(message),
			time: time.toString()
		});
	}

	static code = "remind";
	static category = UtilsCategory.getCode();
	static aliases = ["remindme"];
	static examples = [
		"example.simple",
		"example.message"
	];
	static usage = "remind [<reminder_text>] <time_string>";
	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			min: 1
		}
	};
}

module.exports = RemindCommand;
