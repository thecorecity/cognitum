const BaseCommand = require("../BaseCommand.js");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const Bot = require("../../classes/Bot");

class PingCommand extends BaseCommand {
	static code = "ping";

	async run() {
		return new DefaultEmbed(this.message, "self")
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
