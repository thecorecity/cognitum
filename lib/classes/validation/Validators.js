const CallerPermissionError = require("../errors/CallerPermissionError.js");

/**
 * Check target method permission.
 * @private
 * @param {GuildMember} targetMember
 * @param {PermissionString|PermissionString[]} permissions One permission or list of permissions to check.
 */
function checkPermission(targetMember, permissions) {
	if (typeof permissions === "string")
		permissions = [permissions];
	for (let i = 0, l = permissions.length; i < l; i++) {
		let permissionCode = permissions[i];
		if (!targetMember.permissions.has(permissionCode)) {
			throw new CallerPermissionError(
				"Only guild admin can change local bot prefix!",
				permissions
			);
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
			options
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
			options
		);
	}
};
