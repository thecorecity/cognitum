const Lang = require("../classes/Lang");

/**
 * # Base Command
 * This is base class for commands. Contains configuration for any available commands such as relationships to
 * different categories, resolving command context etc. Also can be used for command classes validation.
 * @interface
 * @example
 * const TargetClass = CommandRegistry.findCommand('help');
 * // HelpCommand class returned
 * console.log(TargetClass.prototype instanceof BaseCommand);
 * // true
 * console.log(CommandRegistry.prototype instanceof BaseCommand);
 * // false
 */
class BaseCommand {
	/**
	 * Current command execution context.
	 * @var {CommandContext}
	 */
	context;

	/**
	 * @param {CommandContext} context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * Main command method. Must be implemented by child classes.
	 * @async
	 * @abstract
	 */
	async run() {
		throw new Error("Command is not implemented!");
	}

	/**
	 * Validate command context before calling command.
	 * @return {Promise<boolean>} Validation result.
	 * @throws BaseError
	 */
	async validate() {
		return true;
	}

	/**
	 * Resolve text for current lang instance.
	 * @param {string} code Field code.
	 * @param {Object<string,string>} [options] (Optional) Fields for replacements.
	 * @return {string} Resolved from Lang text or field code itself if nothing found.
	 */
	resolveLang(code, options) {
		return this.context.getLang().get(code, options);
	}

	/**
	 * Current context message.
	 * @return {Message}
	 */
	get message() {
		return this.context.getMessage();
	}

	/**
	 * Current context arguments.
	 * @return {string[]}
	 */
	get args() {
		return this.context.getArgs();
	}

	/**
	 * Command name. Used for calling command in chat.
	 * @type {string}
	 * @abstract
	 */
	static code;

	/**
	 * Title of command.
	 * @type {string}
	 */
	static title;

	/**
	 * Description of command.
	 * @type {string}
	 */
	static description;

	/**
	 * Usage string.
	 * @type {string}
	 */
	static usage;

	/**
	 * Examples list.
	 * @type {string[]}
	 */
	static examples;

	/**
	 * Command aliases.
	 * @type {string[]}
	 */
	static aliases;

	/**
	 * Category code.
	 * @type {string}
	 */
	static category;

	/**
	 * Get command code.
	 * @return {string} Command code.
	 */
	static getCode() {
		return this.code;
	}

	/**
	 * Get command title. If command title is not provided then returns string in next format: `command.%code%.title`.
	 * @return {string} Command title or generated from command code string.
	 */
	static getTitle() {
		if (typeof this.title !== "string")
			return `command.${this.code}.title`;
		return this.title;
	}

	/**
	 * Get command description. If command title is not provided then returns string in next format:
	 * `command.%code%.description`.
	 * @return {string} Command description or generated from command code string.
	 */
	static getDescription() {
		if (typeof this.description !== "string")
			return `command.${this.code}.description`;
		return this.description;
	}

	/**
	 * Get command usage string.
	 * @return {string} Command usage string.
	 */
	static getUsage() {
		return this.usage;
	}

	/**
	 * Get usage examples.
	 * @return {string[]} Array of examples.
	 */
	static getExamples() {
		return this.examples;
	}

	/**
	 * Get command aliases.
	 * @return {string[]} Array of command aliases.
	 */
	static getAliases() {
		return this.aliases;
	}

	/**
	 * Checks is aliases set correctly.
	 * @return {boolean} Checking result.
	 */
	static aliasesAvailable() {
		return this.aliases instanceof Array && this.aliases.length > 0;
	}

	/**
	 * Get category code.
	 * @return {string} Category code.
	 */
	static getCategory() {
		return this.category;
	}

	/**
	 * Validate command class required metadata for availability.
	 * @return {boolean} Result of validation.
	 */
	static validateMetaInformation() {
		return typeof this.code === "string"
			&& this.code.length > 0
			&& typeof this.category === "string"
			&& this.category.length > 0;
	}
}

module.exports = BaseCommand;
