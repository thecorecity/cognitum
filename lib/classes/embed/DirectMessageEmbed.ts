import { EmbedBuilder, type User } from "discord.js";

export default class DirectMessageEmbed extends EmbedBuilder {
	/**
	 * @param user DiscordJS user instance.
	 */
	constructor(user: User) {
		super();
		this.setColor(0x000000);
		if (user.avatarURL())
			this.setThumbnail(user.avatarURL());
	}
}
