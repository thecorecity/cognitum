const Validators = require("./Validators");

/**
 * # Context Validator
 * Class for command context validation. Used in command classes.
 */
class CommandContextValidator {
	/**
	 * Target command context for validation.
	 * @type {CommandContext}
	 */
	#context;
	/**
	 * Options provided by command class.
	 * @type {ContextValidatorOptions}
	 */
	#options;

	/**
	 * @param {CommandContext} context Command context.
	 * @param {ContextValidatorOptions} validatorOptions Validation options from command class. Contains setting for
	 *     command context validation.
	 */
	constructor(context, validatorOptions) {
		if (!validatorOptions || typeof validatorOptions !== "object")
			throw new Error("Validator options must be an object!");
		this.#context = context;
		this.#options = validatorOptions;
	}

	/**
	 * Begin validation method.
	 * @return {Promise<void>}
	 * @throws {BaseError}
	 */
	async validate() {
		for (let validator in this.#options) {
			if (!this.#options.hasOwnProperty(validator))
				continue;
			if (!Validators.hasOwnProperty(validator))
				continue;
			Validators[validator]({
				context: this.#context,
				options: this.#options[validator]
			});
		}
	}
}

module.exports = CommandContextValidator;
