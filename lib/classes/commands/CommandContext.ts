import _ from "lodash";
import type { Message } from "discord.js";
import type Lang from "../localization/Lang";
import type GuildModel from "../../database/models/GuildModel";
import type GuildChannelModel from "../../database/models/GuildChannelModel";
import type UserModel from "../../database/models/UserModel";
import type GuildMemberModel from "../../database/models/GuildMemberModel";

interface CommandContextOptions {
	/**
	 * Discord message.
	 */
	message: Message<true>;
	/**
	 * Resolved prefix.
	 */
	prefix: string;
	/**
	 * Resolved localization class instance.
	 */
	language: Lang;
	/**
	 * Command execution arguments.
	 */
	args: string[];
	/**
	 * Map of database instances.
	 */
	databaseInstances: ContextModelsInstances;
}

/**
 * # Command Context
 *
 * Context for the command runtime which may be used by commands to determine current context.
 */
export default class CommandContext {
	/**
	 * Current message.
	 */
	readonly #internalMessage: Message<true>;

	/**
	 * Selected prefix for current guild.
	 */
	readonly #internalPrefix: string;

	/**
	 * Arguments for command execution.
	 */
	readonly #internalArguments: string[];

	/**
	 * Selected language pack.
	 */
	readonly #internalLang: Lang;

	/**
	 * Object with database instances resolved on parsing begin.
	 * @type {ContextModelsInstances}
	 */
	readonly #databaseInstances: ContextModelsInstances;

	/**
	 * @param options Context configuration.
	 */
	constructor({ message, prefix, language, args, databaseInstances }: CommandContextOptions) {
		this.#internalMessage = message;
		this.#internalPrefix = prefix;
		this.#internalArguments = args;
		this.#internalLang = language;
		this.#databaseInstances = databaseInstances;
	}

	/**
	 * Current message.
	 */
	get message() {
		return this.#internalMessage;
	}

	/**
	 * Channel of current message. Shorthand for call for the channel from message object.
	 */
	get channel() {
		return this.#internalMessage.channel;
	}

	/**
	 * List of arguments.
	 */
	get args() {
		return this.#internalArguments;
	}

	/**
	 * Current language pack.
	 */
	get lang() {
		return this.#internalLang;
	}

	/**
	 * Current prefix.
	 */
	get prefix() {
		return this.#internalPrefix;
	}

	/**
	 * Database models.
	 */
	get models(): ContextModelsInstances {
		// Clone all the entries to prevent adding anything inside private field.
		return _.clone(this.#databaseInstances);
	}
}

interface ContextModelsInstances {
	guild: GuildModel;
	channel: GuildChannelModel;
	user: UserModel;
	member: GuildMemberModel;
}
