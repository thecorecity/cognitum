const BaseCommand = require("../../classes/base/BaseCommand");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const ConfigManager = require("../../classes/ConfigManager");
const GuildCategory = require("../../categories/GuildCategory");
const { GuildModel } = require("../../classes/Database");

class PrefixCommand extends BaseCommand {
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
		await GuildModel.update(
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
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		callerPermission: "ADMINISTRATOR",
		arguments: {
			min: 0,
			max: 1,
			lengths: [3]
		}
	};

	static aliases = ["setprefix"];

	static examples = [
		"exampleReset",
		"exampleSet"
	];

	static usage = "prefix [<new_prefix>]";
}

module.exports = PrefixCommand;
