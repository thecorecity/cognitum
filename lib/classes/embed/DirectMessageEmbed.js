const { EmbedBuilder } = require("discord.js");

class DirectMessageEmbed extends EmbedBuilder {
	/**
	 * @param {import("discord.js").User} user DiscordJS user instance.
	 */
	constructor(user) {
		super();
		this.color = 0x000000;
		if (user.avatarURL())
			this.thumbnail = { url: user.avatarURL() };
	}
}

module.exports = DirectMessageEmbed;
