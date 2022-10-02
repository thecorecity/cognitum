const BaseCommand = require("../../classes/base/BaseCommand");
const GuildCategory = require("../../categories/GuildCategory");
const { ChannelType } = require("discord-api-types/v10");

class VoiceMergeCommand extends BaseCommand {
	/**
	 * Execute voice channel participants between channels.
	 * @throws {Error} In case if merging is impossible.
	 * @return {Promise<string>} Echo message to the channel.
	 */
	async run() {
		const [currentChannel, targetChannel] = this.#tryResolveChannels();

		// Mapping entries to the array to get size of the map
		const voiceChannelParticipants = [...currentChannel.members.values()];

		for (let index = 0; index < voiceChannelParticipants.length; index++) {
			const targetMember = voiceChannelParticipants[index];
			await targetMember.voice.setChannel(targetChannel.id);
		}

		return this.resolveLang("command.merge.movingCompleted", {
			currentChannel: currentChannel.name,
			targetChannel: targetChannel.name
		});
	}

	/**
	 * Try to resolve current user voice channel and target channel where users of the channel should be redirected.
	 * @throws {Error} In case if current channel or target channel is not set.
	 * @return {Promise<import("discord.js").VoiceChannel[]>} Array with first channel being current channel and the
	 * second one is a channel where users should be merged to.
	 */
	async #tryResolveChannels() {
		const channelFrom = this.message.member.voice?.channel;
		const channelTo = await this.message.guild.channels.fetch(this.args.pop());

		// TODO Make special error for this situation
		if (!channelFrom || !channelTo || channelTo.type !== ChannelType.GuildVoice)
			throw new Error("Current or target voice channel is not found!");

		return [channelFrom, channelTo];
	}

	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		callerPermission: "MOVE_MEMBERS",
		botPermission: "MOVE_MEMBERS",
		arguments: {
			min: 1,
			max: 1,
			values: [
				/^\d+$/
			]
		}
	};

	static code = "merge";
	static category = GuildCategory.getCode();
	static examples = [
		"move"
	];
	static usage = "merge <channelID>";
	static aliases = ["move"];
}

module.exports = VoiceMergeCommand;
