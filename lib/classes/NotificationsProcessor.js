const BaseDiscordModule = require("./base/BaseDiscordModule");
const ConfigManager = require("./ConfigManager");
const { ChannelType } = require("discord-api-types/v10");
const Utils = require("./Utils");
const logger = Utils.createModuleLogger("notifications");

class NotificationsProcessor extends BaseDiscordModule {
	/** @type {ConfigManager} */
	#notificationSettings;
	/** @type {import('discord.js').TextChannel} */
	#targetChannel;

	async initialize() {
		logger.info("Initializing notifications processor...");

		this.#notificationSettings = new ConfigManager("preferences.cognitum.notifications");

		if (!this.#notificationSettings.get("enabled")) {
			logger.info("Notifications are disabled.");
			return this;
		}

		this.#loadListeners();

		return this;
	}

	/**
	 * Register all listeners required for work.
	 */
	#loadListeners() {
		this.client.on("ready", this.#onReady.bind(this));
	}

	/**
	 * Fetch and validate channel.
	 * @returns {Promise<void>}
	 */
	async #fetchChannel() {
		logger.debug("Fetching channel...");

		const maybeGuildId = this.#notificationSettings.get("guild");
		const maybeChannelId = this.#notificationSettings.get("channel");

		logger.debug(`IDs attempting to resolve. Guild ID: ${maybeGuildId}, Channel ID: ${maybeChannelId}`);

		if (!isFinite(maybeGuildId) || !isFinite(maybeChannelId)) {
			logger.error("Invalid guild or channel ID. Please check your settings.");
			return;
		}

		const guild = await this.client.guilds.fetch(maybeGuildId);

		if (!guild) {
			logger.error(`Guild #${maybeGuildId} not found!`);
			return;
		}

		/** @type {import('discord.js').GuildBasedChannel} */
		const channel = await guild.channels.fetch(maybeChannelId);

		if (!channel) {
			logger.error(`Channel #${maybeChannelId} inside guild #${maybeGuildId} not found!`);
			return;
		}

		if (channel.type !== ChannelType.GuildText) {
			logger.error(`Channel #${maybeChannelId} inside guild #${maybeGuildId} is not a text channel!`);
			return;
		}

		this.#targetChannel = channel;
	}

	/**
	 * @param {import('discord.js').Guild} guild
	 */
	async #onGuildCreate(guild) {
		if (!this.#targetChannel)
			return;

		await this.#targetChannel.send({
			content: `:inbox_tray: [JOIN] | \`ID: ${guild.id}\` | \`${Utils.escapeMarkdown(guild.name)}\``,
		});
	}

	/**
	 * @param {import('discord.js').Guild} guild
	 */
	async #onGuildDelete(guild) {
		if (!this.#targetChannel)
			return;

		await this.#targetChannel.send({
			content: `:outbox_tray: [LEAVE] | \`ID: ${guild.id}\` | \`${Utils.escapeMarkdown(guild.name)}\``,
		});
	}

	async #onReady() {
		await this.#loadListenersAfterReady();

		if (!this.#targetChannel)
			return;

		await this.#targetChannel.send({
			content: `:white_check_mark: [READY] | \`${Utils.escapeMarkdown(this.client.user.tag)}\``,
		});
	}

	async #loadListenersAfterReady() {
		await this.#fetchChannel();

		if (!this.#targetChannel) {
			logger.error("Notifications are enabled, but channel is not set. Please check your settings.");
			return this;
		}

		this.client.on("guildCreate", this.#onGuildCreate.bind(this));
		this.client.on("guildDelete", this.#onGuildDelete.bind(this));
	}
}

module.exports = NotificationsProcessor;
