const BaseCommand = require("../../classes/base/BaseCommand");
const BasicCategory = require("../../categories/CoreCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CheckList = require("../../classes/content/CheckList");
const Lang = require("../../classes/localization/Lang");

class LanguageCommand extends BaseCommand {
	async run() {
		if (this.args.length === 0)
			return this.#showLanguagesList();
	}

	#showLanguagesList() {
		const response = new DefaultEmbed(this.context, "guild");
		response.setTitle(
			this.resolveLang("command.lang.listTitle")
		);
		const checkList = new CheckList();
		const languages = Lang.getLanguagesList();
		languages.forEach(language => {
			checkList.push({
				state: language.code === "en",
				text: `\`${language.code}\` ${language.name} [${language.version}] by ${language.authors}`
			});
		});
		response.setDescription(
			checkList.toString()
		);
		return response;
	}

	static code = "lang";
	static category = BasicCategory.getCode();
	static usage = "lang [<language_code>]";
}

module.exports = LanguageCommand;
