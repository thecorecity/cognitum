const { EmbedBuilder } = require("discord.js");

class DirectMessageEmbed extends EmbedBuilder {
	/**
	 * @param {import("discord.js").User} user DiscordJS user instance.
	 */
	constructor(user) {
		super();
		this.setColor(0x000000);
		if (user.avatarURL())
			this.setThumbnail(user.avatarURL());
	}
}

module.exports = DirectMessageEmbed;
