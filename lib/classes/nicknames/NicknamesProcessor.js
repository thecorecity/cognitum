const BaseDiscordModule = require("../base/BaseDiscordModule");
const NicknameSanitizer = require("./NicknameSanitizer");
const { GuildModel } = require("../Database");
const { ChannelType } = require("discord-api-types/v10");
const { PermissionsBitField } = require("discord.js");
const logger = require("../Utils").createModuleLogger("nicknameProcessor");

class NicknamesProcessor extends BaseDiscordModule {
	/**
	 * Initialize nickname sanitizer.
	 * @return {Promise<NicknamesProcessor>}
	 */
	async initialize() {
		logger.info("Initializing nickname sanitizer...");
		this.#attachEventListeners();
		logger.info("Initialized!");
		return this;
	}

	/**
	 * Subscribe to events required for nicknames sanitizing.
	 */
	#attachEventListeners() {
		logger.info("Subscribing events...");
		this.client.logsProcessor.on("rename", (...args) => this.#handleRename(...args));
		this.client.on("message", message => this.#handleMessage(message));
	}

	/**
	 * Handle member rename event.
	 * @param {import("discord.js").GuildMember} previousMember Previous member state.
	 * @param {import("discord.js").GuildMember} currentMember Current member state.
	 */
	async #handleRename(previousMember, currentMember) {
		return this.#sanitize({
			member: currentMember,
			previousNickname: previousMember.displayName
		});
	}

	/**
	 * Handle message event.
	 * @param {import("discord.js").Message} message
	 */
	async #handleMessage(message) {
		if (
			message.author.bot
			|| message.channel.type !== ChannelType.GuildText
			|| message.member.permissions.has(PermissionsBitField.Flags.Administrator)
			|| message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)
		) {
			return;
		}
		return this.#sanitize({ member: message.member });
	}

	/**
	 * Sanitizer function.
	 * @param {Object} payload List of arguments.
	 * @param {import("discord.js").GuildMember} payload.member Target member instance.
	 * @param {string} [payload.previousNickname] Previous nickname if exist.
	 * @return {Promise<void>}
	 */
	async #sanitize(payload) {
		/** @type {GuildModel} */
		const guildInstance = await this.constructor.#resolveGuild(payload.member);
		if (!guildInstance.nickname_mode)
			return;
		let guildSanitizeMode = guildInstance.nickname_type;
		// Check existence of sanitizing mode
		if (!NicknameSanitizer.isModeExist(guildSanitizeMode)) {
			logger.warn(`Sanitizer mode "${guildSanitizeMode}" not exist for guild ${guildInstance.id}!`);
			guildSanitizeMode = NicknameSanitizer.defaultMode;
			guildInstance.nickname_type = guildSanitizeMode;
			await guildInstance.save();
		}
		// Handle previous nickname value if passed
		if (payload.hasOwnProperty("previousNickname") && typeof payload.previousNickname === "string") {
			const previousNameSanitizer = new NicknameSanitizer(payload.previousNickname, guildSanitizeMode);
			if (!previousNameSanitizer.validate())
				delete payload.previousNickname;
		}
		const sanitizer = new NicknameSanitizer(payload.member.displayName, guildSanitizeMode);
		const sanitizedNickname = sanitizer.execute();
		if (payload.member.displayName !== sanitizedNickname) {
			try {
				await payload.member.setNickname(
					payload.previousNickname ?? sanitizedNickname,
					"Nickname sanitized by Cognitum"
				);
			} catch (e) {
				logger.warn("Missing permission for rename!");
			}
		}
	}

	/**
	 * Resolve guild model.
	 * @param {import("discord.js").GuildMember} member Target member.
	 * @return {Promise<GuildModel>}
	 */
	static async #resolveGuild(member) {
		const [model] = await GuildModel.findOrCreate({
			where: {
				id: member.guild.id
			}
		});
		return model;
	}
}

module.exports = NicknamesProcessor;
