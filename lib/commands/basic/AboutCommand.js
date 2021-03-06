const BaseCommand = require("../../classes/base/BaseCommand");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CoreCategory = require("../../categories/CoreCategory");
const ConfigManager = require("../../classes/ConfigManager");

const config = new ConfigManager("preferences.cognitum");
const links = config.extend("commands.about.links");

class AboutCommand extends BaseCommand {
	async run() {
		return new DefaultEmbed(this.context, "self")
			.setTitle(
				this.resolveLang("bot.name")
			)
			.setDescription(
				this.resolveLang(
					"bot.description",
					{
						prefix: this.context.getPrefix() ?? config.get("prefix")
					}
				)
			)
			.addField(
				this.resolveLang("command.about.links.title"),
				this.resolveLang("command.about.links.description", {
					discordGuildInviteUrl: links.get("discordGuild"),
					repositoryUrl: links.get("github"),
					issuesUrl: links.get("githubIssues")
				})
			);
	}

	static code = "about";
	static category = CoreCategory.getCode();
}

module.exports = AboutCommand;
