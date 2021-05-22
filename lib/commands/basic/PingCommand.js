const Bot = require("../../classes/CognitumClient");
const BaseCommand = require("../../classes/base/BaseCommand");
const CoreCategory = require("../../categories/CoreCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");

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
					discordPing: this.getWebsocketHeartbeat(),
					uptime: this.getCurrentUptime()
				})
			);
	}

	/**
	 * Get current Discord API WebSocket heartbeat.
	 * @return {string} String with current WebSocket heartbeat and `ms` on the end.
	 */
	getWebsocketHeartbeat() {
		return this.message.client.ws.ping + " ms";
	}

	/**
	 * Get current bot uptime.
	 * @return {string} String in format 1d1h1m1s.
	 */
	getCurrentUptime() {
		return Bot.getUptimeString();
	}
}

module.exports = PingCommand;
