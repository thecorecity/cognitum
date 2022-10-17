const BaseError = require("../../base/errors/BaseError");

class InvalidLoggingChannelError extends BaseError {
	#maybeChannelId;

	static errorCode = "invalidLoggingChannel";

	/**
	 * @type {Set<string>}
	 * @protected
	 */
	static _detailCodes = new Set([
		"unusualChannelType",
		"invalidChannel",
		"invalidChannelId",
		"missingChannel"
	])

	/**
	 * @param {"unusualChannelType"|"invalidChannel"|"invalidChannelId"|"missingChannel"} detailCode
	 * @param {string} maybeChannelId
	 */
	constructor(detailCode, maybeChannelId = "") {
		if (!InvalidLoggingChannelError._detailCodes.has(detailCode))
			throw new Error("Invalid detail code!");

		super(detailCode);

		this.#maybeChannelId = maybeChannelId;
	}

	generateEmbedTitle() {
		return `embed.errors.${this.constructor.errorCode}.${this.message}.title`;
	}

	generateEmbedDescription() {
		return `embed.errors.${this.constructor.errorCode}.${this.message}.description`;
	}

	// noinspection JSCheckFunctionSignatures
	generateEmbedOptions() {
		return {
			channelId: this.#maybeChannelId
		};
	}
}

module.exports = InvalidLoggingChannelError;
