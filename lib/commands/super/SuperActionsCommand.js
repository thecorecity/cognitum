const BaseSuperUserCommand = require("../../classes/base/commands/BaseSuperUserCommand");
const SuperUserError = require("../../classes/errors/commands/SuperUserError");
const TrackingSettingsCommand = require("../basic/TrackingSettingsCommand");
const { UserModel } = require("../../classes/Database");
const HiddenCategory = require("../../categories/HiddenCategory");
const { createModuleLogger, formatTimeString, formatDataSize } = require("../../classes/Utils");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const GuildsCachingTask = require("../../classes/statistics/tasks/GuildsCachingTask");

const logger = createModuleLogger("sudo");

class SuperActionsCommand extends BaseSuperUserCommand {
	async run() {
		switch (this.args.shift()) {
			case "clearTrackable":
				return await this.#clearTrackable();
			case "stats":
			case "ping":
				return await this.#showStats();
			case "generateGuildCache":
				return await this.#generateGuildCache();
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
				trackable: 0
			}
		});

		logger.info(`Found ${usersList.length} users to clear!`);

		if (usersList.length) {
			await message.edit({
				content: `<a:Loading:1031662942669783200> Clearing data for \`${usersList.length}\` untrackable users...`
			});
		}

		let entriesRemoved = 0;

		for (let userInstance of usersList) {
			logger.info(`Clearing data for user ${userInstance.id}...`);
			entriesRemoved += await TrackingSettingsCommand.removeUserActivity(userInstance.id);
		}

		logger.info("Clearing data for untrackable users finished!");

		await message.edit({
			content: `:white_check_mark: Cleared data for untrackable users! Processed users: \`${usersList.length}\`, removed: \`${entriesRemoved}\`.`,
		});
	}

	async #showStats() {
		const { /** @type {CognitumClient} */ client } = this.context.message;

		return new DefaultEmbed(this.context, "self")
			.setTitle("Detailed Stats")
			.setDescription(
				Array
					.from(
						new Map()
							.set("Cached Guilds", client.guilds.cache.size)
							.set("Cached Channels", client.channels.cache.size)
							.set("Cached Users", client.users.cache.size)
							.set("Memory", formatDataSize(process.memoryUsage().heapUsed))
							.set("Uptime", formatTimeString(process.uptime()))
							.set("Voice Connections", client.voiceStatsManager.storageSize)
							.set("Tasks Queue", client.taskQueue.size)
							.entries()
					)
					.map(([name, value]) => `**${name}**: ${value}`)
					.join("\n")
			);
	}

	async #generateGuildCache() {
		if (!this.args.length)
			throw new SuperUserError("Guild ID is not provided!");

		/** @type {CognitumClient} */
		const client = this.context.message.client;

		client.taskQueue.pushTask(
			new GuildsCachingTask(
				{
					mode: GuildsCachingTask.modeSingleGuild,
					id: this.args.shift()
				},
				new Date().getTime() + 1000
			)
		);

		return ":white_check_mark: Pushed cache generation to the tasks";
	}

	static code = "sudo";
	static category = HiddenCategory.getCode();
}

module.exports = SuperActionsCommand;
