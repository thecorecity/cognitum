const Guild = require("../database/models/Guild.js");
const Lang = require("./Lang.js");

class CommandContext {
	#message;
	#prefix;
	#args;
	/**
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

	getMessage() {
		return this.#message;
	}

	getArgs() {
		return this.#args;
	}

	getLang() {
		return this.#lang;
	}

	async resolvePrefix() {
		this.#prefix = await Guild.resolvePrefix(this.#message.guild.id);
		return this.#prefix;
	}

	async resolveLang() {
		this.#lang = new Lang("en");
		return this.#lang;
	}
}

module.exports = CommandContext;
