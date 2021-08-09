const BaseCommand = require("../../classes/base/BaseCommand");
const GuildCategory = require("../../categories/GuildCategory");

class VoiceMergeCommand extends BaseCommand {
	async run() {
		const currentChannel = this.message.member.voice?.channel;
		const voiceChannel = await this.message.guild.channels.fetch(this.args[0]);

		// TODO Make special error for this situation
		if (!currentChannel || !voiceChannel || voiceChannel.type !== "GUILD_VOICE")
			throw new Error("Current or target voice channel is not found!");

		const moveMembers = currentChannel.members.entries();

		for (let i = 0; i < moveMembers.length; i++) {
			let member = moveMembers[i];
			await member.voice.setChannel(voiceChannel.id);
		}
		return this.resolveLang("command.merge.movingCompleted", {
			currentChannel: currentChannel.name,
			targetChannel: voiceChannel.name
		});
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
