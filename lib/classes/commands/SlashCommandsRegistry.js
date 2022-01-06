const { createModuleLogger, fileExtension } = require("../Utils");
const fs = require("fs/promises");
const BaseSlashCommand = require("../base/BaseSlashCommand");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const logger = createModuleLogger("slashCommandsRegistry");

class SlashCommandsRegistry {
	/**
	 * @type {Map<string, typeof BaseSlashCommand>}
	 */
	static #commands = new Map();

	/**
	 * List of commands builders. Required for commands registration.
	 * @type {SlashCommandBuilder[]}
	 */
	static #applicationCommands = [];

	/**
	 * @param {Object} options
	 * @param {CognitumClient} options.client
	 * @return {Promise<void>}
	 */
	static async initialize({ client }) {
		logger.info("Commands interactions system initialization...");

		const commandsDirectory = await fs.readdir(`${process.cwd()}/lib/interactions/slash`);

		for (let i = 0; i < commandsDirectory.length; i++) {
			const basename = commandsDirectory[0];

			if (basename.startsWith("_"))
				continue;

			if (fileExtension(basename) !== "js")
				continue;

			this.#loadCommandFromPath(`../../interactions/slash/${basename}`);
		}

		if (client.shard.ids.includes(0)) {
			client.on("ready", async () => this.#registerApplicationCommands(client));
		}
	}

	/**
	 * @param {string} requirePath
	 */
	static #loadCommandFromPath(requirePath) {
		/** @type {typeof BaseSlashCommand} */
		let SlashCommandClass;

		try {
			SlashCommandClass = require(requirePath);
		} catch (e) {
			logger.error("Failed to load command! Error details: ");
			console.dir(e);
			process.exit();
		}

		if (!SlashCommandClass || !(SlashCommandClass.prototype instanceof BaseSlashCommand))
			return;

		const builder = SlashCommandClass.build();

		if (!(builder instanceof SlashCommandBuilder)) {
			console.warn("Failed to load command builder!");
			return;
		}

		const commandName = builder.name;

		if (this.#commands.has(commandName))
			throw new Error(`Command with this name is already exist: ${commandName}`);

		this.#applicationCommands.push(builder);
		this.#commands.set(commandName, SlashCommandClass);
	}

	/**
	 * @param commandName
	 * @return {typeof BaseSlashCommand|null}
	 */
	static getCommand(commandName) {
		return this.#commands.has(commandName) ? this.#commands.get(commandName) : null;
	}

	/**
	 * @param {CognitumClient} client
	 * @return {Promise<void>}
	 */
	static async #registerApplicationCommands(client) {
		// noinspection JSCheckFunctionSignatures,JSClosureCompilerSyntax
		await new REST({ version: 9 })
			.setToken(client.token)
			.put(
				Routes.applicationGuildCommands(client.application.id, "726484907433656380"),
				{
					body: this.#applicationCommands
						.map(builder => builder instanceof SlashCommandBuilder && builder.toJSON() || null)
						.filter(builder => !!builder)
				}
			);
	}

	static unload() {
		this.#commands.clear();
	}
}

module.exports = SlashCommandsRegistry;
