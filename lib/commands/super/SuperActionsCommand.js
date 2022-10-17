const BaseSuperUserCommand = require("../../classes/base/commands/BaseSuperUserCommand");
const SuperUserError = require("../../classes/errors/commands/SuperUserError");
const TrackingSettingsCommand = require("../basic/TrackingSettingsCommand");
const { UserModel } = require("../../classes/Database");
const HiddenCategory = require("../../categories/HiddenCategory");

class SuperActionsCommand extends BaseSuperUserCommand {
	async run() {
		switch (this.args.shift()) {
			case "clearTrackable":
				return await this.#clearTrackable();
			default:
				throw new SuperUserError("Unknown action!");
		}
	}

	async #clearTrackable() {
		const { /** @type {import('discord.js').TextChannel} */ channel } = this.context.message;

		const message = await channel.send({
			content: "<a:Loading:1031662942669783200> Clearing data for untrackable users...",
		});

		const usersList = await UserModel.findAll({
			where: {
				trackable: 1
			}
		});

		for (let userInstance of usersList) {
			await TrackingSettingsCommand.removeUserActivity(userInstance.id);
		}

		await message.edit({
			content: `:white_check_mark: Cleared data for untrackable users! Processed users: \`${usersList.length}\`.`,
		});
	}

	static code = "sudo";
	static category = HiddenCategory.getCode();
}

module.exports = SuperActionsCommand;
