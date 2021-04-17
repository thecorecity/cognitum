const BaseTask = require("../../base/BaseTask.js");
const DirectMessageEmbed = require("../../embed/DirectMessageEmbed.js");
const Lang = require("../../localization/Lang.js");
const { createModuleLog } = require("../../Utils.js");
const log = createModuleLog("ReminderTask");

class ReminderTask extends BaseTask {
	/**
	 * @param {Object} options
	 * @param {CognitumClient} options.discordClient
	 * @return {Promise<void>}
	 */
	async run({ discordClient }) {
		const userId = this.payload?.["userId"];
		const messageText = this.payload?.["message"];
		if (!userId)
			return log("error", `User ID is not set! Task ID: ${this.id}.`);
		const targetUser = await discordClient.users.fetch(userId);
		if (!targetUser)
			return log("error", `User not found! ID: ${userId}.`);
		const lang = new Lang("en");
		const embed = new DirectMessageEmbed(targetUser)
			.setTitle(lang.get("embed.tasks.reminder.title"))
			.setDescription(
				!messageText || !messageText?.length
					? lang.get("embed.tasks.reminder.descriptionEmpty")
					: lang.get("embed.tasks.reminder.description", {
						reminderMessage: messageText
					})
			)
			.setFooter(lang.get("embed.tasks.reminder.footer"))
			.setTimestamp(new Date());
		try {
			await targetUser.send(embed);
		} catch (e) {
			log("warn", `Task ${this.id} skipped: Failed to deliver message to user!`);
		}
	}

	static code = "reminder";
	static save = true;
}

module.exports = ReminderTask;
