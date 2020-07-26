const CallerPermissionError = require("../errors/CallerPermissionError.js");
const BotPermissionError = require("../errors/BotPermissionError.js");

/**
 * Check target method permission.
 * @private
 * @param {GuildMember} targetMember
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
	}
};
