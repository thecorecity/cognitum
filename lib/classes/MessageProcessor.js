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

		// Ignoring any bots messages from parsing
		if (author.bot)
			return;

		switch (channel.type) {
			case ChannelType.GuildText:
				// Handling bot mention-only messages
				if (await this.#isMentionOnly(message))
					return await this.#onMessageWithMentionOnly(message);

				await this.#onGuildMessage(message);
				break;

			// Processing threads
			case ChannelType.PublicThread:
			case ChannelType.PrivateThread:
				await this.#onThreadMessage(message);
				break;
		}
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

		message.content = `${guild.prefix ?? ConfigManager.get("preferences.cognitum.prefix")}about`;

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

			await MessageProcessor.#trySendUnhandledErrorMessage(channel, ":warning: Unresolved command result handling error!");
		}
	}

	/**
	 * Handle incoming message from one of the guild threads. This message will be only processed for statistics
	 * generation. No commands will be executed.
	 * @param message
	 * @returns {Promise<void>}
	 */
	async #onThreadMessage(message) {
		await MessageParser.calculateAndStoreStatistics(message);
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

			await this.#trySendUnhandledErrorMessage(channel, ":warning: Unresolved command result handling error!");
		}
	}

	/**
	 * Last resort method for sending error message. If this method fails, then there is no way to send error message to
	 * the selected channel. We just give up.
	 * @param {import('discord.js').GuildChannel} targetChannel Channel where the error message should appear.
	 * @param {string} content Text for the error message.
	 * @return {Promise<void>}
	 */
	static async #trySendUnhandledErrorMessage(targetChannel, content) {
		try {
			await targetChannel.send({ content });
		} catch (e) {
			// Ignoring any following errors. If owner of the guild blocked bot from sending messages, just do nothing.
			// It's their problem.
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
