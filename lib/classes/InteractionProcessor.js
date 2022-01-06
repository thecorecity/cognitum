const BaseDiscordModule = require("./base/BaseDiscordModule");
const { BaseCommandInteraction } = require("discord.js");
const SlashCommandsRegistry = require("./commands/SlashCommandsRegistry");
const InteractionCommandContext = require("./commands/InteractionContext");
const { GuildModel, UserModel, GuildMemberModel, GuildChannelModel } = require("./Database");
const Lang = require("./localization/Lang");

class InteractionProcessor extends BaseDiscordModule {
	async initialize() {
		this._client.on("interactionCreate", interaction => this.#handleInteraction(interaction));
	}

	/**
	 * @param {import('discord.js').Interaction} interaction
	 * @return {Promise<void>}
	 */
	async #handleInteraction(interaction) {
		if (!interaction.isApplicationCommand() || !(interaction instanceof BaseCommandInteraction))
			return;

		const CommandClass = SlashCommandsRegistry.getCommand(interaction.commandName);

		if (!CommandClass)
			return interaction.reply({
				content: ":x: Invalid interaction!"
			});

		const models = await this.constructor.#buildModels(interaction);
		const lang = new Lang(models.guild["language"] ?? "en");

		await new CommandClass(
			new InteractionCommandContext({
				interaction,
				client: this._client,
				models,
				lang
			})
		).execute();
	}

	/**
	 * @param {import('discord.js').Interaction} interaction
	 * @return {Promise<ContextModelsInstances>}
	 */
	static async #buildModels(interaction) {
		const [guild] = GuildModel.findOrCreate({
			where: { id: interaction.guild.id }
		});
		const [user] = await UserModel.findOrCreate({
			where: { id: interaction.author.id }
		});
		const [member] = await GuildMemberModel.findOrCreate({
			where: {
				id_guild: interaction.guild.id,
				id_user: interaction.author.id
			}
		});
		const [channel] = await GuildChannelModel.findOrCreate({
			where: {
				id: interaction.channel.id,
				id_guild: interaction.guild.id
			}
		});

		return { guild, user, member, channel };
	}
}

module.exports = InteractionProcessor;
