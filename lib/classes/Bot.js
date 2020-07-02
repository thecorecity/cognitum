const Config = require("./Config.js");
const Lang = require("./Lang.js");
const CommandsRegistry = require("./CommandsRegistry.js");
const { Database } = require("./Database.js");
const { Client, MessageEmbed } = require("discord.js");
const MessageParser = require("./MessageParser.js");

/**
 * Extended class from Discord Client.
 */
class Bot extends Client {

	/**
     * Main initialization command. Must be called on bot start.
     * @return {Promise<void>}
     */
	async initialize() {
		await Config.initialize();
		await Lang.initialize();
		await Database.initialize();
		await CommandsRegistry.initialize();
		this.bindEvents();
		const auth = require("../../config/auth.json").discord;
		await this.login(auth.token);
	}

	/**
     * Bind required events to DiscordJS.
     */
	bindEvents() {
		this.on("message", this.parseMessage);
	}

	/**
     * Calling parser on new message.
     * @param {Message} message Discord message.
     * @return {Promise<void>}
     */
	async parseMessage(message) {
		const parser = new MessageParser(message);
		const result = await parser.run();
		await this.handleCommandResult(message, result);
	}

	/**
     * Receiving result from called command.
     * @param {Message} message Discord message.
     * @param {*} result Any possible result, returned from command.
     * @return {Promise<void>}
     */
	async handleCommandResult(message, result) {
		if (result instanceof MessageEmbed) {
			await message.channel.send({
				embed: result
			});
		}
	}
}

module.exports = Bot;
