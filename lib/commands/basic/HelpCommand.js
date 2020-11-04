const BaseCommand = require("../../classes/base/BaseCommand.js");
const CommandsRegistry = require("../../classes/commands/CommandsRegistry.js");
const CoreCategory = require("../../categories/CoreCategory.js");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed.js");
const ErrorEmbed = require("../../classes/embed/ErrorEmbed.js");
const { escapeMarkdown } = require("../../classes/Utils");

class HelpCommand extends BaseCommand {
	async run() {
		if (this.args.length === 1)
			return await this.generateCommandInfo(this.args[0]);
		return await this.generateCommandsList();
	}

	static code = "help";
	static usage = this.code + " [<command>]";
	static aliases = ["halp", "h"];
	static category = CoreCategory.getCode();
	static examples = [
		"exampleNoParams",
		"exampleWithParams"
	];

	async generateCommandsList() {
		const response = new DefaultEmbed(this.context, "self")
			.setTitle(
				this.resolveLang("command.help.commandsList")
			);
		delete response.description;
		const map = CommandsRegistry.getCommandsMap();
		for (const categoryName in map) {
			if (!map.hasOwnProperty(categoryName))
				continue;
			const CurrentCategory = CommandsRegistry.findCategory(categoryName);
			response.addField(
				this.resolveLang(
					CurrentCategory.getTitle()
				),
				"`" + map[categoryName].join("` `") + "`"
			);
		}
		return response;
	}

	async generateCommandInfo(commandName) {
		const CommandClass = CommandsRegistry.findCommand(commandName);
		if (!CommandClass || !(CommandClass.prototype instanceof BaseCommand)) {
			return new ErrorEmbed(this.context, "self")
				.setTitle(
					this.resolveLang("embed.errors.commandNotFound.title", {
						commandName
					})
				)
				.setDescription(
					this.resolveLang("embed.errors.commandNotFound.description", {
						prefix: this.context.getPrefix()
					})
				);
		}
		const details = new DefaultEmbed(this.context, "self");
		details.setTitle(
			this.resolveLang(
				CommandClass.getTitle()
			)
		).setDescription(
			this.resolveLang(
				CommandClass.getDescription()
			)
		);
		if (CommandClass.getUsage()?.length) {
			details.addField(
				this.resolveLang("command.help.usageTitle"),
				escapeMarkdown(
					CommandClass.getUsage()
				)
			);
		}
		if (CommandClass.getExamples()?.length) {
			details.addField(
				this.resolveLang("command.help.examplesTitle"),
				CommandClass.getExamples()
					.map(langCode => this.resolveLang(langCode))
					.join("\n")
			);
		}
		if (CommandClass.getAliases()?.length) {
			details.addField(
				this.resolveLang("command.help.aliasesTitle"),
				`\`${CommandClass.getAliases().join("`, `")}\``
			);
		}
		return details;
	}
}

module.exports = HelpCommand;
