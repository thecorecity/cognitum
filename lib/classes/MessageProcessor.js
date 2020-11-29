const BaseDiscordModule = require("./base/BaseDiscordModule");
const MessageParser = require("./commands/MessageParser");
const { MessageEmbed } = require("discord.js");
const log = require("./Utils").createModuleLog("MessageProcessor");

class MessageProcessor extends BaseDiscordModule {
	async initialize() {
		this.client.on("message", async message => {
			await this.#handleMessage(message);
		});
	}

	/**
	 *
	 * @param {module:"discord.js".Message} message
	 */
	async #handleMessage(message) {
		// Ignoring news and direct channels from parsing
		if (message.channel.type !== "text")
			return void ("Not implemented yet!");
		// Ignoring any bots messages from parsing
		if (message.author.bot)
			return;
		await this.#handleGuildMessage(message);
	}

	/**
	 *
	 * @param {module:"discord.js".Message} message
	 */
	async #handleGuildMessage(message) {
		try {
			await this.constructor.#handleGuildMessageResult(
				message,
				await new MessageParser(message).resolve()
			);
		} catch (e) {
			log("error", "Failed to send command execution result!");
			console.error(e);
			return await message.channel.send(":warning: Unresolved command result handling error!");
		}
	}

	static async #handleGuildMessageResult(message, result) {
		try {
			if (result instanceof MessageEmbed)
				return await message.channel.send({ embed: result });
			if (typeof result === "string" && result.length > 0)
				return await message.channel.send(result);
		} catch (e) {
			log("error", "Failed to send command execution result!");
			console.error(e);
			return message.channel.send(":warning: Unresolved command result handling error!");
		}
	}
}

module.exports = MessageProcessor;
