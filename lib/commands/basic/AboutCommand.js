const BaseCommand = require("../../classes/base/BaseCommand");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CoreCategory = require("../../categories/CoreCategory");
const ConfigManager = require("../../classes/ConfigManager");

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
						prefix: this.context.getPrefix() ?? ConfigManager.get("preferences.cognitum.prefix")
					}
				)
			)
			.addField(
				this.resolveLang("command.about.links.title"),
				this.resolveLang("command.about.links.description", {
					discordGuildInviteUrl: ConfigManager.get("preferences.cognitum.commands.about.links.discordGuild"),
					repositoryUrl: ConfigManager.get("preferences.cognitum.commands.about.links.github"),
					issuesUrl: ConfigManager.get("preferences.cognitum.commands.about.links.githubIssues")
				})
			);
	}

	static code = "about";
	static category = CoreCategory.getCode();
}

module.exports = AboutCommand;
