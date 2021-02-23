const BaseCommand = require("../../classes/base/BaseCommand");
const GuildCategory = require("../../categories/GuildCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const NicknameSanitizer = require("../../classes/nicknames/NicknameSanitizer");
const ArgumentError = require("../../classes/errors/ArgumentError");

class NicknameSanitizerCommand extends BaseCommand {
	async run() {
		if (this.args.length === 0)
			return await this.#showStatus();
		if (this.args.length === 1) {
			const subcommand = this.args.shift();
			if (this.constructor.#subcommands.toggleFeature.hasOwnProperty(subcommand))
				return await this.#updateStatus(subcommand === "enable");
			if (subcommand === "modes")
				return await this.#showModesList();
			throw new ArgumentError("valueList", {
				argumentPassed: subcommand,
				argumentExpectedList: "`enable`, `disable`, `modes`"
			});
		}
		if (this.args.length === 2) {
			const subcommand = this.args.shift();
			const mode = this.args.shift();
			if (!this.constructor.#subcommands.modesCommands.hasOwnProperty(subcommand)) {
				throw new ArgumentError("valueList", {
					argumentPassed: subcommand,
					argumentExpectedList: "`set`, `info`"
				});
			}
			if (!NicknameSanitizer.isModeExist(mode)) {
				throw new ArgumentError("valueList", {
					argumentPassed: mode,
					argumentExpectedList: NicknameSanitizer.getModesKeys().map(v => `\`${v}\``).join(", ")
				});
			}
			if (subcommand === "info")
				return await this.#showModeInfo(mode);
			if (subcommand === "set")
				return await this.#changeMode(mode);
		}
		throw new Error("Unhandled command state occurred!");
	}

	/**
	 * Show current feature status.
	 * @return {Promise<DefaultEmbed>} Embed with current status.
	 */
	async #showStatus() {
		const guild = this.context.getGuildInstance();
		const embed = new DefaultEmbed(this.context, "guild");
		let mode = guild["nickname_type"];
		if (!NicknameSanitizer.isModeExist(mode))
			mode = NicknameSanitizer.defaultMode;
		embed
			.setTitle(
				this.resolveLang("command.nickname.status.title")
			)
			.setDescription(
				this.resolveLang("command.nickname.status.description", {
					status: guild["nickname_mode"] === 1
						? this.resolveLang("command.nickname.status.enabled")
						: this.resolveLang("command.nickname.status.disabled"),
					sanitizeModeCode: mode,
					sanitizeModeName: this.resolveLang(`command.nickname.sanitizerMode.${mode}.name`),
				})
			);
		return embed;
	}

	/**
	 * Update feature status.
	 * @param {boolean} state Updated feature status.
	 * @return {Promise<DefaultEmbed>} Successful status changing message.
	 */
	async #updateStatus(state) {
		const guild = this.context.getGuildInstance();
		guild["nickname_mode"] = state ? 1 : 0;
		await guild.save();
		const key = state ? "enabled" : "disabled";
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang(`command.nickname.statusUpdated.${key}.title`)
			)
			.setDescription(
				this.resolveLang(`command.nickname.statusUpdated.${key}.description`)
			);
		return embed;
	}

	/**
	 * Show list of available modes.
	 * @return {Promise<DefaultEmbed>} Embed with list of modes.
	 */
	async #showModesList() {
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang("command.nickname.modesList.title")
			)
			.setDescription(
				NicknameSanitizer
					.getModesKeys()
					.map(key => {
						return `\`${key}\` ${this.resolveLang(`command.nickname.sanitizerMode.${key}.name`)}`;
					})
					.join(";\n") + "."
			);
		return embed;
	}

	/**
	 * Show information about sanitizer mode.
	 * @param {string} mode Target mode.
	 * @return {Promise<DefaultEmbed>} Message with information about sanitizing mode.
	 */
	async #showModeInfo(mode) {
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang(`command.nickname.sanitizerMode.${mode}.name`)
			)
			.setDescription(
				this.resolveLang(`command.nickname.sanitizerMode.${mode}.description`)
			);
		return embed;
	}

	/**
	 * Change current sanitizing mode.
	 * @param {string} mode Mode slug.
	 * @return {Promise<DefaultEmbed>} Successful mode change message.
	 */
	async #changeMode(mode) {
		const guild = this.context.getGuildInstance();
		guild["nickname_type"] = mode;
		await guild.save();
		const embed = new DefaultEmbed(this.context, "guild");
		embed
			.setTitle(
				this.resolveLang("command.nickname.modeChanged.title")
			)
			.setDescription(
				this.resolveLang("command.nickname.modeChanged.description", {
					sanitizerModeCode: mode,
					sanitizerModeName: this.resolveLang(`command.nickname.sanitizerMode.${mode}.name`)
				})
			);
		return embed;
	}

	static code = "nickname";
	static category = GuildCategory.getCode();
	static usage = "nickname { enable | disable | modes | info <mode> | set <mode> }";
	static aliases = ["nicknames", "names", "name"];
	static examples = [
		"examples.showStatus",
		"examples.showModesList",
		"examples.showModeInfo",
		"examples.enable",
		"examples.setMode"
	];

	/** @type {Cognitum.ContextValidatorOptions} */
	static validators = {
		arguments: {
			min: 0,
			max: 2,
			values: [
				["enable", "disable", "modes", "set", "info"]
			]
		},
		botPermission: "MANAGE_NICKNAMES",
		callerPermission: "ADMINISTRATOR"
	};

	/**
	 * Helper object. Used for manual context validation.
	 */
	static #subcommands = {
		toggleFeature: {
			enable: true,
			disable: true
		},
		modesCommands: {
			info: true,
			set: true
		}
	};
}

module.exports = NicknameSanitizerCommand;
