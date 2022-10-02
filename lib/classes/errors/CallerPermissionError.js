const BaseError = require("../base/BaseError");
const ReadablePermissionsMap = require("./helpers/ReadablePermissionsMap");

class CallerPermissionError extends BaseError {
	static errorCode = "callerPermissionError";

	/**
	 * @type {PermissionString[]}
	 */
	permissions;

	/**
	 * @param {string} message Error message.
	 * @param {PermissionString|PermissionString[]} permissions
	 */
	constructor(message, permissions = []) {
		super(message);
		if (typeof permissions === "string" || typeof permissions === "bigint")
			permissions = [permissions];
		this.permissions = permissions;
	}

	generateEmbedOptions(context) {
		let permissions = this.permissions?.map(permission => {
			// New bitfield system does not contain readable names for permissions. We will convert bits into related string
			// names for the translations. Some permissions might not be present in the map, so we will fall back to the bit.
			permission = ReadablePermissionsMap.has(permission)
				? ReadablePermissionsMap.get(permission)
				: permission;

			return context.lang.get(`permissions.${permission}`);
		}) ?? [];
		return {
			permissionsList: permissions.length
				? `\`${permissions.join("`, `")}\``
				: "(empty)"
		};
	}
}

module.exports = CallerPermissionError;
