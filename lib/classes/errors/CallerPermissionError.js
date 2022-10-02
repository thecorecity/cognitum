const BaseError = require("../base/BaseError");
const { PermissionsBitField } = require("discord.js");

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
