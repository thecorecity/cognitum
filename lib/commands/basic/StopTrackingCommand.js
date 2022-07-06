const BaseCommand = require("../../classes/base/BaseCommand");
const CoreCategory = require("../../categories/CoreCategory");
const { MessageStatisticsModel, VoiceStatisticsModel } = require("../../classes/Database");

/**
 * Command for cleaning up user data from the database and stop tracking the user.
 */
class StopTrackingCommand extends BaseCommand {
	/**
	 * Run the command.
	 * @returns {Promise<string>}
	 */
	async run() {
		// Check if user already marked as non-trackable
		if (!this.context.models.user["trackable"]) {
			return "You are already marked as non-trackable. If you want to track your activity again, please use the `trackme` command.";
		}

		// Request confirmation from the user about the cleanup. Send the confirmation message to the user and wait for the response with "confirm".
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
		await this.#markTheUserAsNonTrackable();

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
	 * @returns {Promise<void>}
	 */
	async #markTheUserAsNonTrackable() {
		// Get the user model from the command execution context and mark it as non-trackable
		const userInstance = this.context.models.user;
		userInstance["trackable"] = false;
		await userInstance.save();
	}

	static code = "stoptracking";
	static category = CoreCategory.getCode();
	static aliases = ["untrack", "clear", "reset"];
}

module.exports = StopTrackingCommand;
