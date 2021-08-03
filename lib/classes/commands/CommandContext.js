const _ = require("lodash");

// eslint-disable-next-line no-unused-vars

class CommandContext {
	/**
	 * Current message.
	 * @type {module:"discord.js".Message}
	 */
	#internalMessage;

	/**
	 * Selected prefix for current guild.
	 * @type {string}
	 */
	#internalPrefix;

	/**
	 * Arguments for command execution.
	 * @type {string[]}
	 */
	#internalArguments;

	/**
	 * Selected language pack.
	 * @type {Lang}
	 */
	#internalLang;

	/**
	 * Object with database instances resolved on parsing begin.
	 * @type {Cognitum.ContextModelsInstances}
	 */
	#databaseInstances;

	/**
	 * @param {Object} options Context configuration.
	 * @param {module:"discord.js".Message} options.message Discord message.
	 * @param {string} options.prefix Resolved prefix.
	 * @param {Lang} options.language Resolved localization class instance.
	 * @param {string[]} options.args Command execution arguments.
	 * @param {Cognitum.ContextModelsInstances} options.databaseInstances Map of database instances.
	 */
	constructor({ message, prefix, language, args, databaseInstances }) {
		this.#internalMessage = message;
		this.#internalPrefix = prefix;
		this.#internalArguments = args;
		this.#internalLang = language;
		this.#databaseInstances = databaseInstances;
	}

	/**
	 * Get current context message.
	 * @deprecated Deprecated! Use {@link message} getter instead.
	 * @return {module:"discord.js".Message}
	 */
	getMessage() {
		return this.message;
	}

	/**
	 * Current message.
	 * @return {module:"discord.js".Message}
	 */
	get message() {
		return this.#internalMessage;
	}

	/**
	 * Get current context arguments.
	 * @deprecated Deprecated! Use {@link args} getter instead.
	 * @return {string[]}
	 */
	getArgs() {
		return this.args;
	}

	/**
	 * List of arguments.
	 * @return {string[]}
	 */
	get args() {
		return this.#internalArguments;
	}

	/**
	 * Get current language pack.
	 * @deprecated Deprecated! Use {@link lang} getter instead.
	 * @return {Lang}
	 */
	getLang() {
		return this.lang;
	}

	/**
	 * Current language pack.
	 * @return {Lang}
	 */
	get lang() {
		return this.#internalLang;
	}

	/**
	 * Get current context prefix.
	 * @deprecated Deprecated! Use {@link prefix} getter instead.
	 * @return {string}
	 */
	getPrefix() {
		return this.prefix;
	}

	/**
	 * Current prefix.
	 * @return {string}
	 */
	get prefix() {
		return this.#internalPrefix;
	}

	/**
	 * Get all database instances for the current command context.
	 * @deprecated Deprecated! Use {@link models} getter instead!
	 * @return {Cognitum.ContextModelsInstances}
	 */
	getDatabaseInstances() {
		return this.models;
	}

	/**
	 * Database models.
	 * @return {Cognitum.ContextModelsInstances}
	 */
	get models() {
		// Clone all the entries to prevent adding anything inside private field.
		return _.clone(this.#databaseInstances);
	}

	/**
	 * Get guild database instance.
	 * @deprecated Deprecated! Use {@link models} getter to get all models.
	 * @return {GuildModel}
	 */
	getGuildInstance() {
		return this.#databaseInstances.guild;
	}

	/**
	 * Get user database instance.
	 * @deprecated Deprecated! Use {@link models} getter to get all models.
	 * @return {UserModel}
	 */
	getUserInstance() {
		return this.#databaseInstances.user;
	}

	/**
	 * Get guild member database instance.
	 * @deprecated Deprecated! Use {@link models} getter to get all models.
	 * @return {GuildMemberModel}
	 */
	getMemberInstance() {
		return this.#databaseInstances.member;
	}

	/**
	 * Get guild channel database instance.
	 * @deprecated Deprecated! Use {@link models} getter to get all models.
	 * @return {GuildChannelModel}
	 */
	getChannelInstance() {
		return this.#databaseInstances.channel;
	}
}

module.exports = CommandContext;
