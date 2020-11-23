class BaseDiscordModule {
	/**
	 * Discord client for accessing in child modules classes.
	 * @type {CognitumClient}
	 */
	#discordClient;

	/**
	 * @param {CognitumClient} client Discord client.
	 */
	constructor(client) {
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

module.exports = BaseDiscordModule;
