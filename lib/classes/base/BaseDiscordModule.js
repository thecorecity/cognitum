const BaseInitializable = require("./BaseInitializable");

class BaseDiscordModule extends BaseInitializable {
	/**
	 * Discord client for accessing in child modules classes.
	 * @type {CognitumClient}
	 */
	#client;

	/**
	 * @param {CognitumClient} client Discord client.
	 */
	constructor(client) {
		super();

		this.#client = client;
	}

	/**
	 * Get Discord client instance from the module.
	 * @return {CognitumClient}
	 * @protected
	 */
	get _client() {
		return this.#client;
	}
}

module.exports = BaseDiscordModule;
