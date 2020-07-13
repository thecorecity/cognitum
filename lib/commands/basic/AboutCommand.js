const BaseCommand = require("../BaseCommand");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CoreCategory = require("../../categories/CoreCategory");

class AboutCommand extends BaseCommand {
	async run() {
		const clientUser = this.message.client.user;
		return new DefaultEmbed(this.context, "guild")
			.setThumbnail(
				clientUser.avatarURL({
					format: "png",
					size: 4096
				})
			)
			.setTitle(
				this.resolveLang("bot.name")
			)
			.setDescription(
				this.resolveLang("bot.description")
			)
			.addField(
				this.resolveLang("command.about.links.title"),
				this.resolveLang("command.about.links.description")
			);
	}

	static code = "about";
	static category = CoreCategory.getCode();
}

module.exports = AboutCommand;
