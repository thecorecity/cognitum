const BaseCommand = require("../../classes/base/BaseCommand");
const BasicCategory = require("../../categories/CoreCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CheckList = require("../../classes/content/CheckList");
const Lang = require("../../classes/localization/Lang");

class LanguageCommand extends BaseCommand {
	async run() {
		if (this.args.length === 0)
			return this.#showLanguagesList();
		if (this.args.length === 1)
			return await this.#switchLanguage();
		throw new Error("Incorrect parameters!");
	}

	/**
	 * Show list of languages available for selection.
	 * @return {DefaultEmbed} Embed with list.
	 */
	#showLanguagesList() {
		const response = new DefaultEmbed(this.context, "guild");
		response.setTitle(
			this.resolveLang("command.lang.listTitle")
		);
		const checkList = new CheckList();
		const languages = Lang.getLanguagesList();
		const currentLanguage = this.context.getGuildInstance()?.["language"];
		languages.forEach(language => {
			checkList.push({
				state: language.code === currentLanguage,
				text: `\`${language.code}\` ${language.name} [${language.version}] by ${language.authors}`
			});
		});
		response.setDescription(
			checkList.toString()
		);
		return response;
	}

	/**
	 * Switch language to selected if exist.
	 * @return {Promise<DefaultEmbed>}
	 */
	async #switchLanguage() {
		const languageCode = this.args[0];
		if (!Lang.isPackExist(languageCode))
			throw new Error("This language is not exist!");
		/** @type {Guild} */
		const guild = this.context.getGuildInstance();
		guild["language"] = languageCode;
		await guild.save();
		const lang = new Lang(languageCode);
		const response = new DefaultEmbed(this.context, "guild");
		response.setTitle(lang.get("command.lang.changedTitle"))
			.setDescription(
				lang.get("command.lang.changedDescription", {
					languageName: lang.languageName
				})
			);
		return response;
	}

	static code = "lang";
	static category = BasicCategory.getCode();
	static usage = "lang [<language_code>]";
}

module.exports = LanguageCommand;
