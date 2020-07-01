const BaseCommand = require("../BaseCommand.js");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");

class PingCommand extends BaseCommand {
	async run() {
		return new DefaultEmbed(this.message, 'self')
			.setTitle(
				this.resolveLang("command.ping.embedTitle")
			)
			.setDescription(
				this.resolveLang("command.ping.embedDescription", {
					discordPing: this.getWebsocketHeartbeat(),
					// TODO Implement uptime counting
					uptime: this.getCurrentUptime()
				})
			);
	}

	/**
	 * Get current Discord API WebSocket heartbeat.
	 * @return {string} String with current WebSocket heartbeat and `ms` on the end.
	 */
	getWebsocketHeartbeat() {
		return this.message.client.ws.ping + ' ms';
	}

	/**
	 * Get current bot uptime.
	 * @return {string} String in format 1d1h1m1s.
	 * @todo Implement uptime counting.
	 */
	getCurrentUptime() {
		return "Not implemented";
	}
}

module.exports = PingCommand;
