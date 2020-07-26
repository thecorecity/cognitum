const BaseCommand = require("../BaseCommand.js");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed.js");
const ConfigManager = require("../../classes/ConfigManager.js");
const GuildCategory = require("../../categories/GuildCategory.js");
const InvalidArgumentError = require("../../classes/errors/InvalidArgumentError.js");
const { Guild } = require("../../classes/Database.js");

class PrefixCommand extends BaseCommand {
	async validate() {
		await super.validate();
		if (this.args.length > 1)
			throw new InvalidArgumentError(
				this.resolveLang(
					"command.prefix.error.incorrectArgumentsAmount",
					{
						passed: this.args.length,
						expected: "0–1"
					}
				)
			);
		if (this.args[0]?.length > 3)
			throw new InvalidArgumentError(
				this.resolveLang(
					"command.prefix.error.tooLongPrefix",
					{
						maxSize: 3
					}
				)
			);
		return true;
	}

	async run() {
		if (this.args.length === 0)
			return await this.setDefaultPrefix();
		return await this.setCustomPrefix(this.args[0]);
	}

	/**
	 * Set default guild prefix.
	 * @return {Promise<DefaultEmbed>}
	 */
	async setDefaultPrefix() {
		return await this.setCustomPrefix(null);
	}

	/**
	 * Set guild prefix method. Accepts string and null (for setting up default prefix).
	 * @param {string | null} targetPrefix String with prefix or null for prefix reset.
	 * @return {Promise<DefaultEmbed>}
	 */
	async setCustomPrefix(targetPrefix) {
		await Guild.update(
			{ prefix: targetPrefix },
			this.makeModelOptions()
		);
		const response = new DefaultEmbed(this.context, "guild");
		response
			.setTitle(
				this.resolveLang(
					"command.prefix.changed.title"
				)
			)
			.setDescription(
				this.resolveLang(
					"command.prefix.changed.description" + (
						targetPrefix === null
							? "Default"
							: ""
					),
					{
						prefix: targetPrefix ?? ConfigManager.get("preferences.cognitum.prefix")
					}
				)
			);
		return response;
	}

	/**
	 * Make options for model.
	 * @return {import(sequelize).UpdateOptions}
	 */
	makeModelOptions() {
		return {
			where: {
				id: this.message.guild.id
			}
		};
	}

	static code = "prefix";
	static category = GuildCategory.getCode();

	/**
	 * List of validators applied.
	 * @type {ContextValidatorOptions}
	 */
	static validators = {
		callerPermission: "ADMINISTRATOR"
	};
}

module.exports = PrefixCommand;
