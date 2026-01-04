import BaseTask from "../../base/BaseTask";
import DirectMessageEmbed from "../../embed/DirectMessageEmbed";
import Lang from "../../localization/Lang";
import { createModuleLogger } from "../../Utils";

const logger = createModuleLogger("reminder");

export default class ReminderTask extends BaseTask {
	/**
	 * @param {Object} options
	 * @param {CognitumClient} options.discordClient
	 * @return {Promise<void>}
	 */
	async run({ discordClient }) {
		const userId = this.payload?.["userId"];
		const messageText = this.payload?.["message"];
		if (!userId)
			return void logger.warn(`User ID is not set! Task ID: ${this.id}.`);
		const targetUser = await discordClient.users.fetch(userId);
		if (!targetUser)
			return void logger.warn(`User not found! ID: ${userId}.`);
		const lang = new Lang("en");
		const embed = new DirectMessageEmbed(targetUser)
			.setTitle(lang.get("embed.tasks.reminder.title"))
			.setDescription(
				!messageText?.length
					? lang.get("embed.tasks.reminder.descriptionEmpty")
					: lang.get("embed.tasks.reminder.description", {
						reminderMessage: messageText
					})
			)
			.setFooter({
				text: lang.get("embed.tasks.reminder.footer")
			})
			.setTimestamp(new Date());
		try {
			await targetUser.send({ embeds: [embed] });
		} catch (e) {
			logger.warn(`Task ${this.id} skipped: Failed to deliver message to user!`);
		}
	}

	static code = "reminder";
	static save = true;
}
