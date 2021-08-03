const TimeStringError = require("../errors/TimeStringError");

class TimeString {
	/**
	 * Time string regexp for fetching time from the string.
	 * @type {RegExp}
	 */
	#stringRegexp = /^(?:(?<days>[1-9]\d*)d(?:\s(?!$))?)?(?:(?<hours>2[0-3]|1\d|[1-9])h(?:\s(?!$))?)?(?:(?<minutes>[1-5]\d|[1-9])m(?:\s(?!$))?)?(?:(?<seconds>[1-5]\d|[1-9])s)?$/gm;

	/**
	 * Amount of days.
	 * @type {number}
	 */
	#internalDays = 0;

	/**
	 * Amount of hours.
	 * @type {number}
	 */
	#internalHours = 0;

	/**
	 * Amount of minutes.
	 * @type {number}
	 */
	#internalMinutes = 0;

	/**
	 * Amount of seconds.
	 * @type {number}
	 */
	#internalSeconds = 0;

	/**
	 * Getter with regexp state reset before returning.
	 * @returns {RegExp}
	 */
	get #regexp() {
		this.#stringRegexp.lastIndex = 0;
		return this.#stringRegexp;
	}

	/**
	 * Amount of days inserted into this time string.
	 * @returns {number}
	 */
	get days() {
		return this.#internalDays;
	}

	/**
	 * Set days amount.
	 * @param {number} amount
	 */
	set days(amount) {
		this.constructor.#checkType(amount);

		if (amount < 0)
			throw new TypeError(`Invalid amount of days: ${amount}`);

		this.#internalDays = amount;
	}

	/**
	 * Amount of hours inserted into this time string.
	 * @returns {number}
	 */
	get hours() {
		return this.#internalHours;
	}

	/**
	 * Set hours amount.
	 * @param {number} amount
	 */
	set hours(amount) {
		this.constructor.#checkType(amount);

		if (amount > 23 || amount < 0)
			throw new TypeError(`Invalid amount of hours: ${amount}!`);

		this.#internalHours = amount;
	}

	/**
	 * Amount of minutes inserted into this time string.
	 * @returns {number}
	 */
	get minutes() {
		return this.#internalMinutes;
	}

	/**
	 * Set minutes amount.
	 * @param {number} amount
	 */
	set minutes(amount) {
		this.constructor.#checkType(amount);

		if (amount > 59 || amount < 0)
			throw new TypeError(`Invalid amount of minutes: ${amount}!`);

		this.#internalMinutes = amount;
	}

	/**
	 * Amount of seconds inserted into this time string.
	 * @returns {number}
	 */
	get seconds() {
		return this.#internalSeconds;
	}

	/**
	 * Set seconds amount.
	 * @param {number} amount
	 */
	set seconds(amount) {
		this.constructor.#checkType(amount);

		if (amount > 59 || amount < 0)
			throw new TypeError(`Invalid amount of seconds: ${amount}`);

		this.#internalSeconds = amount;
	}

	/**
	 * @param {string} timeString Initial value.
	 */
	constructor(timeString = "") {
		if (timeString.length > 0)
			this.insertString(timeString);
	}

	/**
	 * Parse string from the value.
	 * @param {string} timeString Target time string.
	 * @return {TimeString}
	 */
	insertString(timeString = "") {
		const result = this.#regexp.exec(timeString);

		if (!result)
			throw new TimeStringError("notParsed");

		this.#internalDays = parseInt(result.groups.days ?? 0);
		this.#internalHours = parseInt(result.groups.hours ?? 0);
		this.#internalMinutes = parseInt(result.groups.minutes ?? 0);
		this.#internalSeconds = parseInt(result.groups.seconds ?? 0);

		return this;
	}

	/**
	 * Insert seconds amount to the time string.
	 * @param {number} seconds Target amount of seconds.
	 * @return {TimeString}
	 */
	insertSeconds(seconds = 0) {
		this.constructor.#checkType(seconds);

		seconds = Math.floor(seconds);

		let minutes = Math.floor(seconds / 60),
			hours = Math.floor(minutes / 60),
			days = Math.floor(hours / 24);

		this.seconds = seconds % 60;
		this.minutes = minutes % 60;
		this.hours = hours % 24;
		this.days = days;

		return this;
	}

	/**
	 * Convert this time string to seconds amount.
	 * @return {number}
	 */
	toSeconds() {
		return this.seconds + this.minutes * 60 + this.hours * 36000 + this.days * 86400;
	}

	/**
	 * Convert this object to original time string.
	 * @return {string}
	 */
	toString() {
		return [
			this.days ? `${this.days}d` : 0,
			this.hours ? `${this.hours}h` : 0,
			this.minutes ? `${this.minutes}m` : 0,
			this.seconds ? `${this.seconds}s` : 0
		].filter(v => !!v).join(" ");
	}

	/**
	 * Check is this value a number. If not - throw an error.
	 * @param {any} v Target value.
	 * @throws {TypeError} If type is not valid for time string values.
	 */
	static #checkType(v) {
		if (typeof v !== "number" || !isFinite(v))
			throw new TypeError("This value should be a finite number!");
	}

	/**
	 * Fast-forward function for converting amount of seconds to the represented time string.
	 * @param seconds
	 * @return {string}
	 */
	static formatTimeString(seconds) {
		return new this()
			.insertSeconds(seconds)
			.toString();
	}
}

module.exports = TimeString;
