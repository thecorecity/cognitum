const BaseDiscordModule = require("./base/BaseDiscordModule");
const MessageParser = require("./commands/MessageParser");
const ConfigManager = require("./ConfigManager");
const { MessageEmbed } = require("discord.js");
const logger = require("./Utils").createModuleLogger("messageProcessor");
const { GuildModel } = require("./Database");

/**
 * # Message Processor
 *
 * Main module used for handling new incoming messages.
 */
class MessageProcessor extends BaseDiscordModule {
	async initialize() {
		this.client.on("messageCreate", async message => {
			await this.#handleMessage(message);
		});
	}

	/**
	 * Handle new message event.
	 * @param {import("discord.js").Message} message
	 */
	async #handleMessage(message) {
		// Ignoring news and direct channels from parsing
		if (message.channel.type !== "GUILD_TEXT")
			return void ("Not implemented yet!");

		// Ignoring any bots messages from parsing
		if (message.author.bot)
			return;

		// Handling bot mention-only messages
		if (await this.#isMentionOnly(message))
			return await this.#handleMention(message);

		await this.#handleGuildMessage(message);
	}

	/**
	 * Handle message with only bot mentions sent.
	 * @param {import("discord.js").Message} message Target message.
	 * @return {Promise<*>}
	 */
	async #handleMention(message) {
		logger.debug("Mention detected! Executing about command.");

		const [guild] = await GuildModel.findOrCreate({
			where: {
				id: message.guild.id
			}
		});

		message.content = `${guild["prefix"] ?? ConfigManager.get("preferences.cognitum.prefix")}about`;

		await this.#handleGuildMessage(message);
	}

	/**
	 * Handle incoming message from one of the guild channels.
	 * @param {import("discord.js").Message} message Target message.
	 */
	async #handleGuildMessage(message) {
		try {
			await this.constructor.#handleGuildMessageResult(
				message,
				await new MessageParser(message).resolve()
			);
		} catch (e) {
			logger.warn("Failed to send command execution result!");
			console.warn(e);
			return await message.channel.send({ content: ":warning: Unresolved command result handling error!" });
		}
	}

	/**
	 * Handle result received from MessageParser call.
	 * @param {import("discord.js").Message} message
	 * @param {string|MessageEmbed|any} result Target result.
	 * @return {Promise<*>}
	 */
	static async #handleGuildMessageResult(message, result) {
		try {
			if (result instanceof MessageEmbed)
				return await message.channel.send({ embeds: [result] });
			if (typeof result === "string" && result.length > 0)
				return await message.channel.send({ content: result });
		} catch (e) {
			logger.warn("Failed to send command execution result!");
			console.warn(e);
			return message.channel.send({ content: ":warning: Unresolved command result handling error!" });
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
