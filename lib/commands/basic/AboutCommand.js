const BaseCommand = require("../BaseCommand");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CoreCategory = require("../../categories/CoreCategory");

class AboutCommand extends BaseCommand {
	async run() {
		const clientUser = this.message.client.user;
		return new DefaultEmbed(this.message, "guild")
			.setThumbnail(
				clientUser.avatarURL({
					format: "png",
					size: 4096
				})
			)
			.setTitle("bot.name")
			.setDescription("bot.description")
			.addField(
				"command.about.links.title",
				"command.about.links.description"
			);
	}

	static code = "about";
	static category = CoreCategory.getCode();
}

module.exports = AboutCommand;
