const BaseCommand = require("../../classes/base/commands/BaseCommand");
const CoreCategory = require("../../categories/CoreCategory");
const { MessageStatisticsModel, VoiceStatisticsModel, GuildMemberModel, DocumentModel } = require("../../classes/Database");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");

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
	 * @return {Promise<DefaultEmbed>}
	 */
	async #processEnableTrackingRequest() {
		// Check if user already marked as trackable
		if (this.context.models.user.trackable) {
			return new DefaultEmbed(this.context, "self")
				.setTitle(
					this.context.lang.get("command.tracking.embeds.alreadyTrackable.title")
				)
				.setDescription(
					this.context.lang.get("command.tracking.embeds.alreadyTrackable.description")
				);
		}

		// Mark the user as trackable in the database
		await this.#toggleUserTrackableTo(true);

		// Return the notification message about user marked as trackable
		return new DefaultEmbed(this.context, "self")
			.setTitle(
				this.context.lang.get("command.tracking.embeds.enabled.title")
			)
			.setDescription(
				this.context.lang.get("command.tracking.embeds.enabled.description")
			);
	}

	/**
	 * Process the request to disable tracking for the user. Requires confirmation.
	 * @return {Promise<DefaultEmbed>}
	 */
	async #processDisableTrackingRequest() {
		// Check if user already marked as non-trackable
		if (!this.context.models.user.trackable) {
			return new DefaultEmbed(this.context, "self")
				.setTitle(
					this.context.lang.get("command.tracking.embeds.alreadyNotTrackable.title")
				)
				.setDescription(
					this.context.lang.get("command.tracking.embeds.alreadyNotTrackable.description")
				);
		}

		// Request confirmation from the user about the cleanup. Send the confirmation message to the user and wait for
		// the response with "confirm".
		await this.context.message.reply({
			embeds: [
				new DefaultEmbed(this.context, "self")
					.setTitle(
						this.context.lang.get("command.tracking.embeds.disableConfirmation.title")
					)
					.setDescription(
						this.context.lang.get("command.tracking.embeds.disableConfirmation.description")
					)
			]
		});

		let confirmationResponse;

		try {
			// Wait for the user to respond with "confirm"
			confirmationResponse = await this.context.channel.awaitMessages({
				max: 1,
				time: 30000,
				filter: (message) => message.author.id === this.context.message.author.id && message.channelId === this.context.message.channelId,
				errors: ["time"]
			});
		} catch (e) {
			// do nothing
		}

		// Check if message was sent by the user and if it was "confirm"
		if (!confirmationResponse || confirmationResponse.size === 0 || confirmationResponse.first().content !== "confirm") {
			return new DefaultEmbed(this.context, "self")
				.setTitle(
					this.context.lang.get("command.tracking.embeds.disableCancelled.title")
				)
				.setDescription(
					this.context.lang.get("command.tracking.embeds.disableCancelled.description")
				);
		}

		// Cleanup the member activity records
		await this.#cleanupUserActivity();
		await this.#toggleUserTrackableTo(false);

		// Return the notification message about user marked as non-trackable
		return new DefaultEmbed(this.context, "self")
			.setTitle(
				this.context.lang.get("command.tracking.embeds.disabled.title")
			)
			.setDescription(
				this.context.lang.get("command.tracking.embeds.disabled.description")
			);
	}

	/**
	 * Cleanup all the member activity records from the database.
	 * @returns {Promise<void>}
	 */
	async #cleanupUserActivity() {
		await TrackingSettingsCommand.removeUserActivity(
			this.context.message.author.id.toString()
		);
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
		userInstance.trackable = +trackable;
		await userInstance.save();
	}

	/**
	 * Remove all the user activity records from the database.
	 * @param {string} userId ID of the user whose activity records should be removed.
	 * @return {Promise<void>}
	 */
	static async removeUserActivity(userId) {
		// Fetching all the members related to current user.
		const membersList = await GuildMemberModel.findAll({
			where: {
				id_user: userId
			}
		});

		// Destroy user data of all the member entries related to current user.
		for (let memberInstance of membersList) {
			await MessageStatisticsModel.destroy({
				where: {
					id_member: memberInstance.id
				}
			});
			await VoiceStatisticsModel.destroy({
				where: {
					id_member: memberInstance.id
				}
			});
			await DocumentModel.destroy({
				where: {
					id_member: memberInstance.id
				}
			});
		}
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
