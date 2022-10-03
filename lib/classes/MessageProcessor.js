const BaseDiscordModule = require("./base/BaseDiscordModule");
const MessageParser = require("./commands/MessageParser");
const ConfigManager = require("./ConfigManager");
const { EmbedBuilder } = require("discord.js");
const logger = require("./Utils").createModuleLogger("messageProcessor");
const { GuildModel } = require("./Database");
const { ChannelType } = require("discord-api-types/v10");

/**
 * # Message Processor
 *
 * Main module used for handling new incoming messages.
 */
class MessageProcessor extends BaseDiscordModule {
	async initialize() {
		this.client.on("messageCreate", this.#onMessageCreate.bind(this));
	}

	/**
	 * Handle new message event.
	 * @param {import("discord.js").Message<true>} message
	 */
	async #onMessageCreate(message) {
		const {
			/** @type {import('discord.js').GuildChannel} */ channel,
			author
		} = message;

		// Ignoring news and direct channels from parsing
		if (channel.type !== ChannelType.GuildText)
			return void ("Not implemented yet!");

		// Ignoring any bots messages from parsing
		if (author.bot)
			return;

		// Handling bot mention-only messages
		if (await this.#isMentionOnly(message))
			return await this.#onMessageWithMentionOnly(message);

		await this.#onGuildMessage(message);
	}

	/**
	 * Handle message with only bot mentions sent.
	 * @param {import("discord.js").Message} message Target message.
	 * @return {Promise<*>}
	 */
	async #onMessageWithMentionOnly(message) {
		logger.debug("Mention detected! Executing about command.");

		const [guild] = await GuildModel.findOrCreate({
			where: {
				id: message.guild.id
			}
		});

		message.content = `${guild["prefix"] ?? ConfigManager.get("preferences.cognitum.prefix")}about`;

		await this.#onGuildMessage(message);
	}

	/**
	 * Handle incoming message from one of the guild channels.
	 * @param {import("discord.js").Message} message Target message.
	 */
	async #onGuildMessage(message) {
		const { /** @type {import('discord.js').GuildChannel} */ channel } = message;

		try {
			await MessageProcessor.#onMessageProcessingResult(
				message,
				await new MessageParser(message).resolve()
			);
		} catch (e) {
			logger.warn("Failed to send command execution result!");
			console.warn(e);
			return await channel.send({ content: ":warning: Unresolved command result handling error!" });
		}
	}

	/**
	 * Handle result received from MessageParser call.
	 * @param {import("discord.js").Message} message
	 * @param {string|import('discord.js').EmbedBuilder|any} commandResult Target result.
	 * @return {Promise<*>}
	 */
	static async #onMessageProcessingResult(message, commandResult) {
		const { /** @type {import('discord.js').GuildChannel} */ channel } = message;

		try {
			// Embed response (only one embed is supported)
			if (commandResult instanceof EmbedBuilder)
				return await channel.send({ embeds: [commandResult] });

			// String responses
			if (typeof commandResult === "string" && commandResult.length > 0)
				return await channel.send({ content: commandResult });
		} catch (e) {
			logger.warn("Failed to send command execution result!");
			console.warn(e);
			return channel.send({ content: ":warning: Unresolved command result handling error!" });
		}
	}

	/**
	 * Check is this message contains mention only.
	 * @param {import("discord.js").Message} message Target message.
	 * @return {Promise<boolean>} Is this mention-only message.
	 */
	async #isMentionOnly(message) {
		return [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`].includes(message.content);
	}
}

module.exports = MessageProcessor;
