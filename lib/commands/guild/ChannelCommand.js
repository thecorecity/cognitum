const BaseCommand = require("../../classes/base/BaseCommand");
const { GuildChannelModel } = require("../../classes/Database");
const { Permissions, BaseGuildTextChannel } = require("discord.js");
const GuildCategory = require("../../categories/GuildCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const CheckList = require("../../classes/content/CheckList");

class ChannelCommand extends BaseCommand {
	async run() {
		if (!this.args.length)
			return await this.#showChannelInfo();
		if (["show", "hide"].includes(this.args[0]))
			return await this.#toggleChannelVisibility(this.args[0] === "show");
		throw new Error("Invalid subcommand detected!");
	}

	/**
	 * Show information about this channel.
	 * @returns {Promise<DefaultEmbed>}
	 */
	async #showChannelInfo() {
		const channelModel = await this.#resolveChannelModel();

		const lang = this.context.lang;
		const channel = this.context.message.channel;

		const channelSettings = new CheckList();

		channelSettings.push({
			state: channelModel["hidden"] === 0,
			text: lang.get("command.channel.info.settings.hidden." + (channelModel["hidden"] === 1 ? "on" : "off"))
		});

		return new DefaultEmbed(this.context, "guild")
			.setTitle(
				lang.get("command.channel.info.title", {
					channelName: channel.isText && channel instanceof BaseGuildTextChannel ? channel.name : channel.id
				})
			)
			.setDescription(
				lang.get("command.channel.info.description", {
					id: `\`${channel.id}\``,
					createdAt: lang.formatDate(channel.createdAt),
					settings: channelSettings.toString()
				})
			);
	}

	/**
	 * Toggle visibility of the channel to the exact state.
	 * @param {boolean} targetState
	 */
	async #toggleChannelVisibility(targetState) {
		if (!this.#isMemberCanManageChannel())
			throw new Error("You can not manage this channel!");
		const targetChannel = await this.#resolveChannelModel();
		targetChannel["hidden"] = targetState ? 0 : 1;
		await targetChannel.save();

		const updatedChannelSettings = new CheckList();

		updatedChannelSettings.push({
			state: targetState ? 1 : 0,
			text: this.context.lang.get("command.channel.info.settings.hidden." + (!targetState ? "on" : "off"))
		});

		return new DefaultEmbed(this.context, "guild")
			.setTitle(
				this.context.lang.get("command.channel.visibilityToggle.title")
			)
			.setDescription(
				this.context.lang.get("command.channel.visibilityToggle.description", {
					channelId: this.context.message.channelId,
					settings: updatedChannelSettings.toString()
				})
			);
	}

	/**
	 * Get the channel model from the database.
	 * @returns {Promise<GuildChannelModel>}
	 */
	async #resolveChannelModel() {
		return await GuildChannelModel.findOne({
			where: {
				id: this.context.message.channel.id,
				id_guild: this.context.message.guild.id
			}
		});
	}

	/**
	 * Check if the caller of the command has access to manage this channel.
	 * @returns {boolean}
	 */
	#isMemberCanManageChannel() {
		return this.context.message.member
			.permissionsIn(this.context.message.channelId)
			.has(Permissions.FLAGS.MANAGE_CHANNELS);
	}

	static code = "channel";
	static category = GuildCategory.getCode();

	/** @type {Cognitum.ContextValidatorOptions} */
	static validators = {
		arguments: {
			min: 0,
			max: 1,
			values: [
				[
					"hide",
					"show"
				]
			]
		}
	};
}

module.exports = ChannelCommand;
