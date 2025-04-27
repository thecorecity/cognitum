import BaseInitializable from "./BaseInitializable";

export default class BaseDiscordModule extends BaseInitializable {
	/**
	 * Discord client for accessing in child modules classes.
	 * @type {CognitumClient}
	 */
	#discordClient;

	/**
	 * @param {CognitumClient} client Discord client.
	 */
	constructor(client) {
		super();

		this.#discordClient = client;
	}

	/**
	 * Get Discord client instance from the module.
	 * @return {CognitumClient}
	 */
	get client() {
		return this.#discordClient;
	}
}
