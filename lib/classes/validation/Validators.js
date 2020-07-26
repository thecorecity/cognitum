// noinspection JSUnusedGlobalSymbols
module.exports = {
	/**
	 * Validate caller with list of required permissions.
	 * @param {Object} config Data for validator function.
	 * @param {CommandContext} config.context Command context for validation.
	 * @param {PermissionString|PermissionString[]} config.options Permission or array of permissions to check.
	 */
	callerPermission({ context, options }) {
		const member = context.getMessage().member;
		if (typeof options === "string")
			options = [options];
		for (let i = 0, l = options.length; i < l; i++) {
			let permissionCode = options[i];
			if (!member.permissions.has(permissionCode)) {
				// TODO Throw on permission is not available.
			}
		}
	}
};
