class InteractionContext {
	/**
	 * @type {import('discord.js').Interaction}
	 */
	#internalInteraction;

	/**
	 * @type {CognitumClient}
	 */
	#internalClient;

	/**
	 * @type {ContextModelsInstances}
	 */
	#internalModels;

	/**
	 * @type {Lang}
	 */
	#internalLang;

	/**
	 * @param {Object} options
	 * @param {CognitumClient} options.client
	 * @param {import('discord.js').Interaction} options.interaction
	 * @param {ContextModelsInstances} options.models
	 * @param {Lang} options.lang
	 */
	constructor({client, interaction, models, lang}) {
		this.#internalClient = client;
		this.#internalInteraction = interaction;
		this.#internalModels = models;
		this.#internalLang = lang;
	}

	/**
	 * @return {CognitumClient}
	 */
	get client() {
		return this.#internalClient;
	}

	/**
	 * @return {import('discord.js').Interaction}
	 */
	get interaction() {
		return this.#internalInteraction;
	}

	/**
	 * @return {ContextModelsInstances}
	 */
	get models() {
		return this.#internalModels;
	}

	/**
	 * @return {Lang}
	 */
	get lang() {
		return this.#internalLang;
	}
}

module.exports = InteractionContext;

/**
 * @typedef {Object} InteractionContextOptions
 * @property {CognitumClient} client
 * @property {import('discord.js').Interaction} interaction
 */
