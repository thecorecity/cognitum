const axios = require("axios");
const BaseTask = require("../../base/BaseTask");
const { createModuleLogger } = require("../../Utils");
const logger = createModuleLogger("monitoringTask");
const ConfigManager = require("../../ConfigManager");

const monitoring = new ConfigManager("auth.monitoring");

// noinspection ExceptionCaughtLocallyJS

class MonitoringStatsTask extends BaseTask {
	/** @type {CognitumClient} */
	#discordClient;

	/**
	 * @property {Object} options Options.
	 * @property {CognitumClient} options.discordClient Discord client.
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
		if (monitoring.get("botsServerDiscord")?.length)
			await this.#sendBotsServerDiscord();
		if (monitoring.get("topGG")?.length)
			await this.#sendTopGG();
	}

	async #sendBotsServerDiscord() {
		logger.info("Sending stats to bots.server-discord.com...");
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
						Authorization: `SDC ${monitoring.get("botsServerDiscord")}`
					}
				}
			);
			if (response.data?.error)
				throw new Error(`bots.server-discord.com replied with error! Message: ${response.data.error?.message}.`);
			if (response.data?.status)
				logger.info("bots.server-discord.com stats pushed!");
		} catch (error) {
			logger.warn("Failed to push bots.server-discord.com stats!");
			console.warn(error);
		}
	}

	async #sendTopGG() {
		logger.info("Sending stats to top.gg...");
		try {
			await axios.post(
				`https://top.gg/api/bots/${this.#discordClient.user.id}/stats`,
				{
					server_count: this.#discordClient.guilds.cache.size
				},
				{
					responseType: "json",
					headers: {
						Authorization: monitoring.get("topGG")
					}
				}
			);

			logger.info("top.gg stats pushed!");
		} catch (error) {
			logger.warn("Failed to push top.gg stats!");
			console.warn(error);
		}
	}

	static save = false;
	static code = "stats";
}

module.exports = MonitoringStatsTask;
