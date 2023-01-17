const BaseCommand = require("../../classes/base/commands/BaseCommand");
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
						prefix: this.context.prefix ?? config.get("prefix")
					}
				)
			)
			.addFields({
				name: this.resolveLang("command.about.links.title"),
				value: this.resolveLang("command.about.links.description", {
					discordGuildInviteUrl: links.get("discordGuild"),
					repositoryUrl: links.get("github"),
					issuesUrl: links.get("githubIssues")
				})
			});
	}

	static code = "about";
	static category = CoreCategory.getCode();
}

module.exports = AboutCommand;
