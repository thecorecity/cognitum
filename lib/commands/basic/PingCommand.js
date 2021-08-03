const CognitumClient = require("../../classes/CognitumClient");
const BaseCommand = require("../../classes/base/BaseCommand");
const CoreCategory = require("../../categories/CoreCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const { formatDataSize } = require("../../classes/Utils");

class PingCommand extends BaseCommand {
	static code = "ping";
	static category = CoreCategory.getCode();

	async run() {
		return new DefaultEmbed(this.context, "self")
			.setTitle(
				this.resolveLang("command.ping.embedTitle")
			)
			.setDescription(
				this.resolveLang("command.ping.embedDescription", {
					discordPing: this.#webSocketHeartbeat,
					uptime: this.constructor.#uptime,
					memoryUsage: this.constructor.#memoryUsage,
					shardGuilds: this.#guildsCount
				})
			);
	}

	/**
	 * Get current Discord API WebSocket heartbeat.
	 * @return {string}
	 */
	get #webSocketHeartbeat() {
		return this.message.client.ws.ping + " ms";
	}

	/**
	 *
	 * @return {number}
	 */
	get #guildsCount() {
		return this.context.getMessage().client.guilds.cache.size;
	}

	/**
	 * Get current uptime.
	 * @return {string}
	 */
	static get #uptime() {
		return CognitumClient.getUptimeString();
	}

	static get #memoryUsage() {
		return formatDataSize(
			process.memoryUsage().heapUsed
		);
	}
}

module.exports = PingCommand;
