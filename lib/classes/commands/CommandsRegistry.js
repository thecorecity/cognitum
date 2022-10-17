const fs = require("fs").promises;
const { fileExtension, createModuleLogger } = require("../Utils");
const logger = createModuleLogger("commands");
const BaseCommand = require("../base/commands/BaseCommand");
const BaseCategory = require("../base/commands/BaseCategory");

/**
 * # Command Registry
 *
 * Global registry of commands. Contains all commands, aliases and categories.
 */
class CommandsRegistry {
	/**
	 * Object map of commands. Used for catching commands.
	 * @type {Map<string, typeof BaseCommand>}
	 */
	static commands = new Map();

	/**
	 * Map of aliases for commands.
	 * @type {Map<string, string>}
	 */
	static aliases = new Map();

	/**
	 * Map of categories.
	 * @type {Map<string, typeof BaseCategory>}
	 */
	static categories = new Map();

	/**
	 * Asynchronous initialization method. It loads all categories and commands from commands and categories
	 * directories, handling aliases for commands and storing this data to commands, aliases and categories objects.
	 * @return {Promise<void>}
	 */
	static async initialize() {
		logger.info("Commands system initialization...");
		logger.info("Loading categories...");

		/** @type {string[]} */
		const categoriesDirectory = await fs.readdir(process.cwd() + "/lib/categories");

		categoriesDirectory.forEach(filename => {
			if (filename.startsWith("_"))
				return;

			const extension = fileExtension(filename);

			if (extension !== "js")
				return;

			/** @type {typeof BaseCategory|function} */
			const CategoryClass = require("../../categories/" + filename);

			if (!(CategoryClass.prototype instanceof BaseCategory))
				return;

			const code = CategoryClass.getCode();

			if (this.categories.has(code)) {
				logger.error(`Category with following code already exist: ${code}!`);
				process.exit();
			}

			this.categories.set(code, CategoryClass);
			logger.debug(`Category successfully loaded: ${code}!`);
		});

		logger.info("Loading commands...");
		/**
		 * Collection of subdirectories for loading commands.
		 * @type {CommandChildDirectory[]}
		 */
		let commandsFilenames = [];
		const commandsDirectory = await fs.readdir(process.cwd() + "/lib/commands");

		for (let name of commandsDirectory) {
			if (name.startsWith("_"))
				continue;

			try {
				let dir = await fs.readdir(process.cwd() + "/lib/commands/" + name);
				commandsFilenames.push({ name, dir });
			} catch (e) {
				logger.warn(`Skipped ${name}: not a directory...`);
			}
		}

		commandsFilenames.forEach(directory => {
			directory.dir?.forEach(basename => {
				if (basename.startsWith("_"))
					return;

				const extension = fileExtension(basename);

				if (extension !== "js")
					return;

				this.#loadCommandFromPath(`../../commands/${directory.name}/${basename}`);
			});
		});
	}

	/**
	 * Load command class from selected path.
	 * @param {string} requirePath Path for require.
	 */
	static #loadCommandFromPath(requirePath) {
		let CommandClass;

		try {
			CommandClass = require(requirePath);
		} catch (e) {
			logger.error("Command loading failed! Error details:");
			console.dir(e);
			process.exit();
		}

		if (!CommandClass || !(CommandClass.prototype instanceof BaseCommand))
			return;

		const commandName = CommandClass.getCode();

		if (!CommandClass.validateMetaInformation()) {
			logger.error(`Command validation failed for ${commandName} command!`);
			process.exit();
		}

		if (this.commands.has(commandName)) {
			logger.error(`Command with following code already available: ${commandName}!`);
			process.exit();
		}

		this.commands.set(commandName, CommandClass);
		logger.debug(`Command ${commandName} successfully loaded!`);

		if (!CommandClass.aliasesAvailable())
			return;

		logger.debug(`Loading aliases for ${commandName}...`);
		const aliasesList = CommandClass.getAliases();

		aliasesList.forEach(aliasName => {
			if (this.aliases.has(aliasName)) {
				logger.error(`Warning! Alias ${aliasName} already used by command ${this.aliases[aliasName]}!`);
				process.exit();
			}

			this.aliases.set(aliasName, commandName);
			logger.debug(`Alias registered: ${aliasName} => ${commandName}.`);
		});
	}

	/**
	 * Find command by command code. If there is alias for this code available, it will use command from alias instead
	 * of real command code.
	 * @param {string} nameOrAlias Command code or alias.
	 * @return {typeof BaseCommand|boolean} Command class if command found. If no commands found, method will
	 *     return `false`.
	 * @example
	 * // Get and call some command from registry
	 * let Command = CommandRegistry.findCommand('help');
	 * if (Command.prototype instanceof BaseCommand) {
	 *     const commandInstance = new Command(message, args);
	 *     commandInstance.run();
	 * } else {
	 *     // If command not found it will fail instanceof check.
	 * }
	 */
	static findCommand(nameOrAlias) {
		return this.commands.get(this.aliases.get(nameOrAlias) ?? nameOrAlias) ?? false;
	}

	/**
	 * Find category by category code.
	 * @param {string} code Category code.
	 * @return {boolean|typeof BaseCategory} Category class if category found. If not categories found, method
	 *     will return `false`.
	 */
	static findCategory(code) {
		if (!this.categories.has(code))
			return false;

		return this.categories.get(code);
	}

	/**
	 * Return map of commands, separated by categories.
	 * @return {Object<string, array>} Map of command names, separated by categories. Object keys are categories codes.
	 */
	static getCommandsMap() {
		let resultCommands = {};

		for (const commandName of this.commands.keys()) {
			const CommandClass = this.commands.get(commandName);
			const categoryCode = CommandClass.getCategory();

			// Skip hidden categories from command map
			if (!this.categories.has(categoryCode) || !this.categories.get(categoryCode).getVisible())
				continue;

			resultCommands[categoryCode] ??= [];
			resultCommands[categoryCode].push(commandName);
		}

		return resultCommands;
	}
}

/**
 * Object with metadata for loading commands from commands directory.
 * @typedef {{name: string, dir: string[]}} CommandChildDirectory
 */

module.exports = CommandsRegistry;
