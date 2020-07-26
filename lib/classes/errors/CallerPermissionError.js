const BaseError = require("./BaseError.js");

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
		if (typeof permissions === "string")
			permissions = [permissions];
		this.permissions = permissions;
	}

	generateEmbedOptions(context) {
		let permissions = this.permissions?.map(permission => {
			return context.getLang().get(`permissions.${permission}`);
		}) ?? [];
		return {
			permissionsList: permissions.length ? permissions : "(empty)"
		};
	}
}

module.exports = CallerPermissionError;
