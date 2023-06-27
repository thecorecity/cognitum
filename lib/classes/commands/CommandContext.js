const _ = require("lodash");
const { GuildModel } = require("../Database");

/**
 * # Command Context
 *
 * Context for the command runtime which may be used by commands to determine current context.
 */
class CommandContext {
	/**
	 * Current message.
	 * @type {import("discord.js").Message}
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
	 * @type {ContextModelsInstances}
	 */
	#databaseInstances;

	/**
	 * @param {Object} options Context configuration.
	 * @param {import("discord.js").Message} options.message Discord message.
	 * @param {string} options.prefix Resolved prefix.
	 * @param {Lang} options.language Resolved localization class instance.
	 * @param {string[]} options.args Command execution arguments.
	 * @param {ContextModelsInstances} options.databaseInstances Map of database instances.
	 */
	constructor({ message, prefix, language, args, databaseInstances }) {
		this.#internalMessage = message;
		this.#internalPrefix = prefix;
		this.#internalArguments = args;
		this.#internalLang = language;
		this.#databaseInstances = databaseInstances;
	}

	/**
	 * Current message.
	 * @return {import("discord.js").Message}
	 */
	get message() {
		return this.#internalMessage;
	}

	/**
	 * Channel of current message. Shorthand for call for the channel from message object.
	 * @returns {import('discord.js').TextChannel}
	 */
	get channel() {
		return this.#internalMessage.channel;
	}

	/**
	 * List of arguments.
	 * @return {string[]}
	 */
	get args() {
		return this.#internalArguments;
	}

	/**
	 * Current language pack.
	 * @return {Lang}
	 */
	get lang() {
		return this.#internalLang;
	}

	/**
	 * Current prefix.
	 * @return {string}
	 */
	get prefix() {
		return this.#internalPrefix;
	}

	/**
	 * Database models.
	 * @return {ContextModelsInstances}
	 */
	get models() {
		// Clone all the entries to prevent adding anything inside private field.
		return _.clone(this.#databaseInstances);
	}
}

module.exports = CommandContext;

/**
 * @typedef {Object} ContextModelsInstances
 * @property {GuildModel} guild
 * @property {GuildChannelModel} channel
 * @property {UserModel} user
 * @property {GuildMemberModel} member
 */
