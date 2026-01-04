import CognitumClient from "../../classes/CognitumClient";
import BaseCommand from "../../classes/base/commands/BaseCommand";
import CoreCategory from "../../categories/CoreCategory";
import DefaultEmbed from "../../classes/embed/DefaultEmbed";
import { formatDataSize } from "../../classes/Utils";

export default class PingCommand extends BaseCommand {
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
		return this.context.message.client.guilds.cache.size;
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
