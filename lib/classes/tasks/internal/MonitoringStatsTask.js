const axios = require("axios");
const BaseTask = require("../../base/BaseTask");
const { createModuleLog } = require("../../Utils");
const log = createModuleLog("MonitoringStatsTask");
const ConfigManager = require("../../ConfigManager");

class MonitoringStatsTask extends BaseTask {
	/** @type {Bot} */
	#discordClient;

	/**
	 * @property {Object} options Options.
	 * @property {Bot} options.discordClient Discord client.
	 * @return {Promise<void>}
	 */
	async run(options) {
		this.#discordClient = options.discordClient;
		await this.#sendStats();
		this.#discordClient.taskQueue.pushTask(
			new MonitoringStatsTask(null, new Date().getTime() + 600000)
		);
	}

	async #sendStats() {
		await this.#sendBotsServerDiscord();
	}

	async #sendBotsServerDiscord() {
		log("log", "Sending stats to bots.server-discord.com...");
		try {
			const response = await axios.post(
				`https://api.server-discord.com/v2/bots/${this.#discordClient.user.id}/stats`,
				{
					servers: this.#discordClient.guilds.cache.size,
					shards: 0
				},
				{
					responseType: "json",
					headers: {
						Authorization: `SDC ${ConfigManager.get("auth.monitoring.botsServerDiscord")}`
					}
				}
			);
			if (response.data?.error)
				throw new Error(`bots.server-discord.com replied with error! Message: ${response.data.error?.message}.`);
			if (response.data?.status)
				log("success", "bots.server-discord.com stats pushed!");
		} catch (error) {
			log("error", "Failed to push bots.server-discord.com stats!");
			console.error(error);
		}
	}

	static save = false;
	static code = "stats";
}

module.exports = MonitoringStatsTask;
