class DiscordTimestamp {
	/**
	 * @type {Date}
	 */
	#date;
	/**
	 * @type {string}
	 */
	#style;

	/**
	 * @param {Date} date Date to render the tag from.
	 * @param {string} style Selected date style.
	 */
	constructor(date, style = DiscordTimestamp.styleDefault) {
		this.#date = date;
		this.#style = style;
	}

	/**
	 * Set style for the date tag.
	 * @param {string} style Style for the tag.
	 * @return {DiscordTimestamp}
	 */
	setStyle(style) {
		this.#style = style;
		return this;
	}

	/**
	 * Render the tag for the Discord.
	 * @return {string}
	 */
	toString() {
		return `<t:${DiscordTimestamp.#passUnixSeconds(this.#date)}${DiscordTimestamp.#passStyle(this.#style)}>`;
	}

	/**
	 * Convert amount of milliseconds to the amount of seconds.
	 * @param {Date} date Date to use to convert into timestamp.
	 * @return {number} Timestamp in seconds.
	 */
	static #passUnixSeconds(date) {
		return Math.floor(date.getTime() / 1000);
	}

	/**
	 * Pass the style to the tag if present.
	 * @param style
	 * @return {string}
	 */
	static #passStyle(style) {
		if (!style)
			return "";

		return `:${style}`;
	}

	/**
	 * # Default Style
	 *
	 * Example output:
	 *
	 * - November 28, 2018 9:01 AM
	 * - 28 November 2018 09:01
	 * @type {string}
	 */
	static styleDefault = "";
	/**
	 * # Short Time
	 *
	 * Example output:
	 *
	 * - 9:01 AM
	 * - 09:01
	 * @type {string}
	 */
	static styleShortTime = "t";
	/**
	 * # Long Time
	 *
	 * Example output:
	 *
	 * - 9:01:00 AM
	 * - 09:01:00
	 * @type {string}
	 */
	static styleLongTime = "T";
	/**
	 * # Short Date
	 *
	 * Example output:
	 *
	 * - 11/28/2018
	 * - 28/11/2018
	 * @type {string}
	 */
	static styleShortDate = "d";
	/**
	 * # Long Date
	 *
	 * Example output:
	 *
	 * - November 28, 2018
	 * - 28 November 2018
	 * @type {string}
	 */
	static styleLongDate = "D";
	/**
	 * # Short Date/Time
	 *
	 * Example output:
	 *
	 * - November 28, 2018 9:01 AM
	 * - 28 November 2018 09:01
	 * @type {string}
	 */
	static styleShortFull = "f";
	/**
	 * # Long Date/Time
	 *
	 * Example output:
	 *
	 * - Wednesday, November 28, 2018 9:01 AM
	 * - Wednesday, 28 November 2018 09:01
	 * @type {string}
	 */
	static styleLongFull = "F";
	/**
	 * # Relative Time
	 *
	 * Example output:
	 *
	 * - 3 years ago
	 * @type {string}
	 */
	static styleRelative = "R";
}

module.exports = DiscordTimestamp;
