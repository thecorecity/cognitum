class CommandContext {
	/**
	 * Current message.
	 * @type {Message}
	 */
	#message;

	/**
	 * Selected prefix for current guild.
	 * @type {string}
	 */
	#prefix;

	/**
	 * Arguments for command execution.
	 * @type {string[]}
	 */
	#args;

	/**
	 * Selected language pack.
	 * @type {Lang}
	 */
	#lang;

	/**
	 * @param {Object} options Context configuration.
	 * @param {Message} options.message Discord message.
	 * @param {string} options.prefix Resolved prefix.
	 * @param {Lang} options.language Resolved localization class instance.
	 * @param {Object<string>} options.args Command execution arguments.
	 */
	constructor({ message, prefix, language, args }) {
		this.#message = message;
		this.#prefix = prefix;
		this.#args = args;
		this.#lang = language;
	}

	/**
	 * Get current context message.
	 * @return {Message}
	 */
	getMessage() {
		return this.#message;
	}

	/**
	 * Get current context arguments.
	 * @return {string[]}
	 */
	getArgs() {
		return this.#args;
	}

	/**
	 * Get current language pack.
	 * @return {Lang}
	 */
	getLang() {
		return this.#lang;
	}

	/**
	 * Get current context prefix.
	 * @return {string}
	 */
	getPrefix() {
		return this.#prefix;
	}
}

module.exports = CommandContext;
