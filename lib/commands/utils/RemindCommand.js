const BaseCommand = require("../../classes/base/BaseCommand");
const UtilsCategory = require("../../categories/UtilsCategory");
const TimeStringError = require("../../classes/errors/TimeStringError");
const ReminderTask = require("../../classes/tasks/commands/ReminderTask");
const { escapeMarkdown, formatTimeString } = require("../../classes/Utils");

class RemindCommand extends BaseCommand {

	#timeStringRegexp = /^(?:(?<days>[1-9]\d*|[1-9])d)?(?:(?<hours>2[0-3]|1\d|[1-9])h)?(?:(?<minutes>[1-5]\d|[1-9])m)?(?:(?<seconds>[1-5]\d|[1-9])s)?$/;

	async run() {
		const seconds = this.constructor.#calculateSeconds(
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
		this.#timeStringRegexp.lastIndex = 0;
		const parsed = this.#timeStringRegexp.exec(this.args[this.args.length - 1]);
		if (!parsed)
			throw new TimeStringError("notParsed");
		return {
			days: parseInt(parsed.groups.days ?? 0),
			hours: parseInt(parsed.groups.hours ?? 0),
			minutes: parseInt(parsed.groups.minutes ?? 0),
			seconds: parseInt(parsed.groups.seconds ?? 0)
		};
	}

	/**
	 * Calculate amount of seconds for reminder.
	 * @param {Cognitum.TimeStringParseResult} timeParts Time parts parsed from argument.
	 * @return {number} Amount of seconds.
	 */
	static #calculateSeconds(timeParts) {
		const result = (
			(timeParts.seconds ? timeParts.seconds : 0) +
			(timeParts.minutes ? timeParts.minutes * 60 : 0) +
			(timeParts.hours ? timeParts.hours * 3600 : 0) +
			(timeParts.days ? timeParts.days * 86400 : 0)
		);
		if (result <= 0)
			throw new TimeStringError("zeroTime");
		return result;
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
