const BaseCommand = require("../../classes/base/BaseCommand");
const UtilsCategory = require("../../categories/UtilsCategory");
const TimeStringError = require("../../classes/errors/TimeStringError");
const ReminderTask = require("../../classes/tasks/commands/ReminderTask");
const { escapeMarkdown, formatTimeString } = require("../../classes/Utils");

class RemindCommand extends BaseCommand {
	async run() {
		const seconds = this.#calculateSeconds(
			this.#parseTimeArgument()
		);
		this.args.pop();
		const message = this.args.join(" ");
		this.#createReminderTask(message, seconds);
		return this.#createSuccessMessage(message, seconds);
	}

	/**
	 * Parse time argument and return elements.
	 * @return {Cognitum.TimeStringParseResult}
	 */
	#parseTimeArgument() {
		const parsed = /^((\d\d?)d)?((\d\d?)h)?((\d\d?)m)?((\d\d?)s)?$/.exec(this.args[this.args.length - 1]);
		if (!parsed)
			throw new TimeStringError("notParsed");
		const time = {
			days: parseInt(parsed[2]),
			hours: parseInt(parsed[4]),
			minutes: parseInt(parsed[6]),
			seconds: parseInt(parsed[8])
		};
		if (
			time.days && (time.days < 1 || time.days > 30)
			|| time.hours && (time.hours < 1 || time.hours > 23)
			|| time.minutes && (time.minutes < 1 || time.minutes > 59)
			|| time.seconds && (time.seconds < 1 || time.seconds > 59)
		) {
			throw new TimeStringError("wrongParams");
		}
		return time;
	}

	/**
	 * Calculate amount of seconds for reminder.
	 * @param {Cognitum.TimeStringParseResult} timeParts Time parts parsed from argument.
	 * @return {number} Amount of seconds.
	 */
	#calculateSeconds(timeParts) {
		return (
			(timeParts.seconds ? timeParts.seconds : 0) +
			(timeParts.minutes ? timeParts.minutes * 60 : 0) +
			(timeParts.hours ? timeParts.hours * 3600 : 0) +
			(timeParts.days ? timeParts.days * 86400 : 0)
		);
	}

	/**
	 * Push reminder task to tasks queue.
	 * @param {string} [message] Reminder message.
	 * @param {number} time Time in seconds for reminder for future execution.
	 */
	#createReminderTask(message, time) {
		// noinspection JSValidateTypes
		/** @type {Bot} */
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
	 * @param {number} time Number of seconds.
	 * @return {string} Message for replying.
	 */
	#createSuccessMessage(message, time) {
		return this.resolveLang("command.remind.successful", {
			message: escapeMarkdown(message),
			time: formatTimeString(time)
		});
	}

	static code = "remind";
	static category = UtilsCategory.getCode();
	static aliases = ["remindme"];
	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			min: 2
		}
	};
}

module.exports = RemindCommand;
