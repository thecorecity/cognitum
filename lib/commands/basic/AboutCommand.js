import BaseCommand from "../../classes/base/commands/BaseCommand";
import DefaultEmbed from "../../classes/embed/DefaultEmbed";
import CoreCategory from "../../categories/CoreCategory";
import ConfigManager from "../../classes/ConfigManager";

const config = new ConfigManager("preferences.cognitum");
const links = config.extend("commands.about.links");

export default class AboutCommand extends BaseCommand {
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
