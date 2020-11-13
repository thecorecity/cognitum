const CallerPermissionError = require("../errors/CallerPermissionError.js");
const BotPermissionError = require("../errors/BotPermissionError.js");
const ArgumentError = require("../errors/ArgumentError.js");

/**
 * Check target method permission.
 * @private
 * @param {module:"discord.js".GuildMember} targetMember
 * @param {PermissionString|PermissionString[]} permissions One permission or list of permissions to check.
 * @param {"caller"|"bot"} mode Error mode to show.
 */
function checkPermission(targetMember, permissions, mode) {
	if (typeof permissions === "string")
		permissions = [permissions];
	for (let i = 0, l = permissions.length; i < l; i++) {
		let permissionCode = permissions[i];
		if (!targetMember.permissions.has(permissionCode)) {
			if (mode === "caller")
				throw new CallerPermissionError(
					"Caller missing permissions!",
					permissions
				);
			else if (mode === "bot")
				throw new BotPermissionError(
					"Bot missing permissions!",
					permissions
				);
			else {
				console.trace("Incorrect checkPermission mode passed!");
				throw new Error("Internal permission validation error!");
			}
		}
	}
}

// noinspection JSUnusedGlobalSymbols
module.exports = {
	/**
	 * Validate caller with list of required permissions.
	 * @param {Object} config Data for validator function.
	 * @param {CommandContext} config.context Command context for validation.
	 * @param {PermissionString|PermissionString[]} config.options Permission or array of permissions to check.
	 */
	callerPermission({ context, options }) {
		checkPermission(
			context.getMessage().member,
			options,
			"caller"
		);
	},
	/**
	 * Validate bot with list of required permissions.
	 * @param {Object} config Data for validator function.
	 * @param {CommandContext} config.context Command context for validation.
	 * @param {PermissionString|PermissionString[]} config.options Permission or array of permissions to check.
	 */
	botPermission({ context, options }) {
		checkPermission(
			context.getMessage().guild.me,
			options,
			"bot"
		);
	},
	/**
	 * Validate arguments passed into command.
	 * @param {Object} config Data for validator function.
	 * @param {CommandContext} config.context Command context for validation
	 * @param {CommandArgumentsOptions} [config.options={}]
	 */
	arguments({ context, options = {} }) {
		// Minimal amount of arguments required checking.
		if (
			options.hasOwnProperty("min")
			&& typeof options.min === "number"
			&& context.getArgs().length < options.min
		) {
			throw new ArgumentError("min", {
				minValue: options.min
			});
		}
		// Maximal amount of arguments required checking.
		if (
			options.hasOwnProperty("max")
			&& typeof options.max === "number"
			&& context.getArgs().length > options.max
		) {
			throw new ArgumentError("max", {
				maxValue: options.max
			});
		}
		// Checking arguments lengths from array.
		if (
			options.hasOwnProperty("lengths")
			&& options.lengths instanceof Array
		) {
			const args = context.getArgs();
			const lens = options.lengths;
			// Global length validation mode.
			const globalMode = options?.lengthsMode ?? "max";
			// Local length validation mode for overwriting.
			let currentMode = globalMode;
			for (let i = 0; i < args.length; i++) {
				currentMode = globalMode;
				let argument = args[i];
				let lengthRequired = lens[i] ?? null;
				// If null passed or this index is out of lengths array range
				// then just skip this argument from validation.
				if (lengthRequired === null)
					continue;
				// In case there is object passed, rewriting global validation mode
				// with mode passed into "mode" field of the object and rewriting object
				// with "value" field for continuing validation.
				if (
					typeof lengthRequired === "object"
				) {
					if (
						lengthRequired.hasOwnProperty("value")
						&& typeof lengthRequired.value !== "number"
						&& isFinite(lengthRequired.value)
						&& lengthRequired.hasOwnProperty("mode")
						&& typeof lengthRequired.mode === "string"
					) {
						currentMode = lengthRequired.mode;
						lengthRequired = lengthRequired.value;
					} else {
						// If not valid object passed then throwing unexpected for caller
						// error which will be reported in console log.
						throw new Error(
							`Fields "value" and "mode" required in lengths validation array element [${i}]!`
						);
					}
				}
				// Validation process for different modes.
				if (
					// Validating argument length in max length mode.
					currentMode === "max"
					&& argument.length > lengthRequired
				) {
					throw new ArgumentError("length", {
						argumentIndex: i + 1,
						requiredLength: "≤ " + lengthRequired
					});
				} else if (
					// Validating argument length in exact length mode.
					currentMode === "exact"
					&& argument.length !== lengthRequired
				) {
					throw new ArgumentError("length", {
						argumentIndex: i + 1,
						requiredLength: "= " + lengthRequired
					});
				} else {
					// If not valid mode passed then throwing unexpected for caller
					// error which will be reported in console log.
					throw new Error(
						`Unexpected argument length validation mode passed: "${currentMode}"`
					);
				}
			}
		}
		// Checking argument values
		if (
			options.hasOwnProperty("values")
			&& options.values instanceof Array
		) {
			const args = context.getArgs();
			const values = options.values;

			for (let i = 0; i < args.length; i++) {
				const argument = args[i];
				const required = values[i] ?? null;

				// If null element provided then this validation value will be skipped
				if (required === null)
					continue;

				if (
					required instanceof Array &&
					!required.includes(argument)
				) {
					// If array passed then checking for argument availability in
					// this array. If it not exists in this array then it will fail validation
					throw new ArgumentError("valueList", {
						argumentPassed: argument,
						argumentExpectedList: `\`${required.join("`, `")}\``
					});
				} else if (
					required instanceof RegExp
					&& !required.test(argument)
				) {
					// If regexp passed then it will test argument with this regexp
					throw new ArgumentError("value", {
						argumentPassed: argument
					});
				}
			}
		}
	}
};
