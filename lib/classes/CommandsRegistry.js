const fs = require("fs").promises;
const { log, fileExtension } = require("./Utils.js");
const BaseCommand = require("../commands/BaseCommand.js");
const BaseCategory = require("../categories/BaseCategory.js");

/**
 * # Command Registry
 *
 * Global registry of commands. Contains all commands, aliases and categories.
 */
class CommandsRegistry {
	/**
     * Object map of commands. Used for catching commands.
     * @type {Object<string, BaseCommand.>}
     */
	static commands = {};

	/**
     * Map of aliases for commands.
     * @type {Object<string, string>}
     */
	static aliases = {};

	/**
     * Map of categories.
     * @type {Object<string, BaseCategory.>}
     */
	static categories = {};

	/**
     * Asynchronous initialization method. It loads all categories and commands from commands and categories
     * directories, handling aliases for commands and storing this data to commands, aliases and categories objects.
     * @return {Promise<void>}
     */
	static async initialize() {
		log("info", "Commands system initialization...");
		log("log", "Loading categories...");
		const categoriesDirectory = await fs.readdir(process.cwd() + "/lib/categories");
		categoriesDirectory.forEach(filename => {
			if (filename.startsWith("_"))
				return;
			const extension = fileExtension(filename);
			if (extension !== "js")
				return;
			const Category = require("../categories/" + filename);
			if (!(Category.prototype instanceof BaseCategory))
				return;
			const code = Category.getCode();
			if (this.categories.hasOwnProperty(code)) {
				log("error", "Category with following code already exist: " + code + "!");
				process.exit();
			}
			this.categories[code] = Category;
		});
		log("log", "Loading commands...");
		let commandsFilenames = [];
		const commandsDirectory = await fs.readdir(process.cwd() + "/lib/commands");
		for (let name of commandsDirectory) {
			if (name.startsWith("_"))
				continue;
			try {
				let dir = await fs.readdir(process.cwd() + "/lib/commands/" + name);
				commandsFilenames.push({ name, dir });
			} catch {
				// ignored
			}
		}
		commandsFilenames.forEach(directory => {
			directory.dir?.forEach(basename => {
				if (basename.startsWith("_"))
					return;
				const extension = fileExtension(basename);
				if (extension !== "js")
					return;
				this.loadCommandFromPath(`../commands/${directory.name}/${basename}`);
			});
		});
	}

	/**
     * Load command class from selected path.
     * @param {string} requirePath Path for require.
     */
	static loadCommandFromPath(requirePath) {
		let CommandClass;
		try {
			CommandClass = require(requirePath);
		} catch (e) {
			log("error", "Command loading failed! Error details:");
			console.dir(e);
			process.exit();
		}
		if (!CommandClass || !(CommandClass.prototype instanceof BaseCommand))
			return;
		const code = CommandClass.getCode();
		if (this.commands.hasOwnProperty(code)) {
			log("error", "Command with following code already available: " + code + "!");
			process.exit();
		}
		this.commands[code] = CommandClass;
		log("log", `Command ${code} successfully loaded!`);
		if (!CommandClass.aliasesAvailable())
			return;
		log("log", `Loading aliases for ${code}...`);
		const aliases = CommandClass.getAliases();
		aliases.forEach(alias => {
			if (this.aliases.hasOwnProperty(alias)) {
				log("error", `Warning! Alias ${alias} already used by command ${this.aliases[alias]}!`);
				process.exit();
			}
			this.aliases[alias] = code;
			log("log", `Alias registered: ${alias} => ${code}.`);
		});
	}

	/**
     * Find command by command code. If there is alias for this code available, it will use command from alias instead
     * of real command code.
     * @param {string} code Command code or alias.
     * @return {BaseCommand.|boolean} Command class if command found. If no commands found, method will
     *     return `false`.
     * @example
     * // Get and call some command from registry
     * let Command = CommandRegistry.findCommand('help');
     * if (Command.prototype instanceof BaseCommand) {
     *     const commandInstance = new Command(message, args);
     *     commandInstance.run();
     * } else {
     *     // If command not found it will fails instanceof check.
     * }
     */
	static findCommand(code) {
		return this.commands[this.aliases[code] ?? code] ?? false;
	}

	/**
     * Find category by category code.
     * @param {string} code Category code.
     * @return {boolean|BaseCategory.} Category class if category found. If not categories found, method
     *     will return `false`.
     */
	static findCategory(code) {
		if (!this.categories.hasOwnProperty(code))
			return false;
		return this.categories[code];
	}

	/**
     * Return map of commands, separated by categories.
     * @return {Object<string, array>} Map of command names, separated by categories. Object keys are categories codes.
     */
	static getCommandsMap() {
		let map = {};
		for (const commandCode in this.commands) {
			if (!this.commands.hasOwnProperty(commandCode))
				continue;
			const CommandClass = this.commands[commandCode];
			const categoryCode = CommandClass.getCategory();
			if (!map.hasOwnProperty(categoryCode))
				map[categoryCode] = [];
			map[categoryCode].push(commandCode);
		}
		return map;
	}
}

module.exports = CommandsRegistry;
