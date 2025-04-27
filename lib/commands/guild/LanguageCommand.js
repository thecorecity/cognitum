import BaseCommand from "../../classes/base/commands/BaseCommand";
import GuildCategory from "../../categories/GuildCategory";
import DefaultEmbed from "../../classes/embed/DefaultEmbed";
import CheckList from "../../classes/content/CheckList";
import Lang from "../../classes/localization/Lang";
import ArgumentError from "../../classes/errors/ArgumentError";
import {PermissionsBitField} from "discord.js";

export default class LanguageCommand extends BaseCommand {
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
		const currentLanguage = this.context.models.guild.language;
		languages.forEach(language => {
			checkList.push({
				state: language.code === currentLanguage,
				text: `\`${language.code}\` ${language.name}`
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

		if (!Lang.isPackExist(languageCode)) {
			throw new ArgumentError("valueList", {
				argumentPassed: languageCode,
				argumentExpectedList: "`" + Lang.getLanguagesList().map(meta => meta.code).join("`, `") + "`"
			});
		}

		const guild = this.context.models.guild;
		guild.language = languageCode;
		await guild.save();

		const lang = new Lang(languageCode);

		return new DefaultEmbed(this.context, "guild")
			.setTitle(lang.get("command.lang.changedTitle"))
			.setDescription(
				lang.get("command.lang.changedDescription", {
					languageName: lang.languageName
				})
			);
	}

	static code = "lang";
	static category = GuildCategory.getCode();
	static usage = "lang [<language_code>]";
	/** @type {Cognitum.ContextValidatorOptions} */
	static validators = {
		callerPermission: PermissionsBitField.Flags.Administrator,
		arguments: {
			max: 1
		}
	};
}
