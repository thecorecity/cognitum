const { MessageEmbed } = require("discord.js");

class DirectMessageEmbed extends MessageEmbed {
	/**
	 * @param {module:"discord.js".User} user DiscordJS user instance.
	 */
	constructor(user) {
		super();
		this.color = 0x000000;
		if (user.avatarURL())
			this.thumbnail = { url: user.avatarURL() };
	}
}

module.exports = DirectMessageEmbed;
