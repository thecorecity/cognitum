const _ = require("lodash");
// eslint-disable-next-line no-unused-vars
const Database = require("./Database.js");

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
	 * Object with database instances resolved on parsing begin.
	 * @type {DatabaseInstances}
	 */
	#databaseInstances;

	/**
	 * @param {Object} options Context configuration.
	 * @param {Message} options.message Discord message.
	 * @param {string} options.prefix Resolved prefix.
	 * @param {Lang} options.language Resolved localization class instance.
	 * @param {string[]} options.args Command execution arguments.
	 * @param {DatabaseInstances} options.databaseInstances Map of database instances.
	 */
	constructor({ message, prefix, language, args, databaseInstances }) {
		this.#message = message;
		this.#prefix = prefix;
		this.#args = args;
		this.#lang = language;
		this.#databaseInstances = databaseInstances;
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

	/**
	 * Get all database instances for the current command context.
	 * @return {DatabaseInstances}
	 */
	getDatabaseInstances() {
		return _.clone(this.#databaseInstances);
	}

	/**
	 * Get guild database instance
	 * @return {Database.Guild}
	 */
	getGuildInstance() {
		return this.#databaseInstances.guild;
	}

	/**
	 * Get user database instance.
	 * @return {Database.User}
	 */
	getUserInstance() {
		return this.#databaseInstances.user;
	}

	/**
	 * Get guild member database instance.
	 * @return {Database.GuildMember}
	 */
	getMemberInstance() {
		return this.#databaseInstances.member;
	}

	/**
	 * Get guild channel database instance.
	 * @return {Database.GuildChannel}
	 */
	getChannelInstance() {
		return this.#databaseInstances.channel;
	}
}

module.exports = CommandContext;
