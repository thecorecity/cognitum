const BaseCommand = require("../../classes/base/BaseCommand");
const CoreCategory = require("../../categories/CoreCategory");
const { MessageStatisticsModel, VoiceStatisticsModel } = require("../../classes/Database");

/**
 * Command for cleaning up user data from the database and stop tracking the user.
 */
class TrackingSettingsCommand extends BaseCommand {
	/**
	 * Run the command.
	 * @returns {Promise<string>}
	 */
	async run() {
		if (this.args[0] === "on")
			return this.#processEnableTrackingRequest();
		if (this.args[0] === "off")
			return this.#processDisableTrackingRequest();

		throw new Error("Unhandled tracking command argument!");
	}

	/**
	 * Process the request to enable tracking for the user. Confirmation is not required.
	 * @return {Promise<string>}
	 */
	async #processEnableTrackingRequest() {
		// Check if user already marked as trackable
		if (this.context.models.user["trackable"]) {
			return "You are already marked as trackable. If you want to stop tracking your activity, please use the `tracking off` command.";
		}

		// Mark the user as trackable in the database
		await this.#toggleUserTrackableTo(true);

		// Return the notification message about user marked as trackable
		return "User data tracking enabled successfully! Bot will now start tracking activity for this user.";
	}

	/**
	 * Process the request to disable tracking for the user. Requires confirmation.
	 * @return {Promise<string>}
	 */
	async #processDisableTrackingRequest() {
		// Check if user already marked as non-trackable
		if (!this.context.models.user["trackable"]) {
			return "You are already marked as non-trackable. If you want to track your activity again, please use the `tracking on` command.";
		}

		// Request confirmation from the user about the cleanup. Send the confirmation message to the user and wait for
		// the response with "confirm".
		const confirmationMessage = "Are you sure you want to stop tracking your activity? This will delete all your activity records from the database.\n\n" +
			"This action cannot be undone.\n\n" +
			"Type `confirm` to confirm.";
		await this.context.message.reply({ content: confirmationMessage });

		// Wait for the user to respond with "confirm"
		const confirmationResponse = await this.context.channel.awaitMessages({
			max: 1,
			time: 30000,
			filter: (message) => message.author.id === this.context.message.author.id && message.channelId === this.context.message.channelId,
			errors: ["time"]
		});

		// Check if message was sent by the user and if it was "confirm"
		if (confirmationResponse.size === 0 || confirmationResponse.first().content !== "confirm") {
			return "Operation cancelled.";
		}

		// Cleanup the member activity records
		await this.#cleanupMemberActivity();
		await this.#toggleUserTrackableTo(false);

		// Return the notification message about user marked as non-trackable
		return "User data cleaned up successfully! Bot will no longer track this user.";
	}

	/**
	 * Cleanup all the member activity records from the database.
	 * @returns {Promise<void>}
	 */
	async #cleanupMemberActivity() {
		// Member database model from the command context
		const memberInstance = this.context.models.member;

		// Destroying all the message and voice statistics for the member
		await MessageStatisticsModel.destroy({
			where: {
				id_member: memberInstance["id"]
			}
		});
		await VoiceStatisticsModel.destroy({
			where: {
				id_member: memberInstance["id"]
			}
		});
	}

	/**
	 * Mark the user as non-trackable in the database.
	 * @param {boolean} trackable - Whether the user is trackable or not.
	 * @returns {Promise<void>}
	 */
	async #toggleUserTrackableTo(trackable) {
		if (typeof trackable !== "boolean") {
			throw new TypeError("Trackable argument must be a boolean!");
		}

		// Get the user model from the command execution context and mark it as non-trackable
		const userInstance = this.context.models.user;
		userInstance["trackable"] = trackable;
		await userInstance.save();
	}

	static code = "tracking";
	static category = CoreCategory.getCode();
	static aliases = ["track"];
	static usage = `${this.code} { on | off }`;
	static examples = [
		"example.enable",
		"example.disable"
	];
	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			min: 1,
			max: 1,
			values: [["on", "off"]]
		}
	}
}

module.exports = TrackingSettingsCommand;
