const BaseCommand = require("../../classes/base/commands/BaseCommand");
const StatisticsCategory = require("../../categories/StatisticsCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const { PermissionsBitField } = require("discord.js");
const { parseToBigIntOrDefault, formatTimeString } = require("../../classes/Utils");
const StatisticsManager = require("../../classes/statistics/StatisticsManager");
const { GuildMemberModel } = require("../../classes/Database");

class ProfileCommand extends BaseCommand {
	/**
	 * @type {import("discord.js").GuildMember}
	 */
	#targetMember;

	async run() {
		this.#targetMember = this.message.member;
		if (this.args.length === 1 && this.message.mentions.members.size)
			this.#targetMember = await this.message.mentions.members.last().fetch();
		return await this.#generateProfile();
	}

	/**
	 * Generate profile for target member.
	 * @return {Promise<DefaultEmbed>} Generated profile.
	 */
	async #generateProfile() {
		const embed = new DefaultEmbed(this.context, "user");
		embed
			.setTitle(
				this.resolveLang(
					this.#targetMember.user.bot
						? "command.profile.botTitle"
						: "command.profile.memberTitle",
					{
						username: this.#targetMember.user.username
					}
				)
			)
			.setThumbnail(this.#targetMember.user.avatarURL())
			.setDescription(
				await this.#generateProfileDescription()
			);
		return embed;
	}

	/**
	 * Generate profile description for target member.
	 * @return {Promise<string>} Generated string for embed description.
	 *
	 * @todo Calculate messages score and show it in profile.
	 * @todo Calculate voice time and show it in profile.
	 * @todo Store and show first guild visit in database.
	 */
	async #generateProfileDescription() {
		let messageActivity, voiceActivity;

		if (this.#targetMember.id === this.context.message.member.id) {
			messageActivity = parseToBigIntOrDefault(this.context.models.member.message);
			voiceActivity = parseToBigIntOrDefault(this.context.models.member.voice);
		} else {
			const member = await GuildMemberModel.findOne({
				where: {
					id_user: this.#targetMember.id.toString(),
					id_guild: this.context.message.guild.id.toString()
				}
			});

			messageActivity = parseToBigIntOrDefault(member.message);
			voiceActivity = parseToBigIntOrDefault(member.voice);
		}

		let date = ProfileCommand.#parseDateOrNull(this.context.models.guild.cache_timestamp);

		if (date) {
			const userId = this.#targetMember.id;
			const statisticsManager = new StatisticsManager(this.message);

			const [messageStats] = await statisticsManager.queryTopMembers({ dateStart: date, entity: userId });
			const [voiceStats] = await statisticsManager.queryTopVoice({ dateStart: date, entity: userId });

			if (messageStats)
				messageActivity += parseToBigIntOrDefault(messageStats.getDataValue("total_weight"));

			if (voiceStats)
				voiceActivity += parseToBigIntOrDefault(voiceStats.getDataValue("total_weight"));
		}

		return [
			this.#targetMember.user.bot
				? this.resolveLang("command.profile.parts.bot")
				: null,
			this.#targetMember.guild.ownerId === this.#targetMember.id
				? this.resolveLang("command.profile.parts.owner")
				: null,
			this.#targetMember.permissions.has(PermissionsBitField.Flags.Administrator)
				? this.resolveLang("command.profile.parts.admin")
				: null,
			this.resolveLang("command.profile.parts.lastJoined", {
				joinDate: this.context.lang.formatDate(this.#targetMember.joinedAt)
			}),
			this.resolveLang("command.profile.parts.accountCreated", {
				createDate: this.context.lang.formatDate(this.#targetMember.user.createdAt)
			}),
			typeof messageActivity === "bigint" && messageActivity > 0n
				? this.resolveLang("command.profile.parts.chatActivity", {
					totalWords: messageActivity.toString()
				})
				: null,
			typeof voiceActivity === "bigint" && voiceActivity > 0n
				? this.resolveLang("command.profile.parts.voiceActivity", {
					totalTime: formatTimeString(parseInt(voiceActivity.toString()))
				})
				: null
		].filter(part => part?.length).join("\n");
	}

	/**
	 * @param {any} targetDate Value to parse.
	 * @return {Date|null} Date or null if not parsed.
	 */
	static #parseDateOrNull(targetDate) {
		if (targetDate instanceof Date)
			return targetDate;

		try {
			targetDate = new Date(targetDate);
		} catch (e) {
			// Nothing to do.
		}

		if (!(targetDate instanceof Date) || isNaN(targetDate.getTime()))
			return null;

		return targetDate;
	}

	static category = StatisticsCategory.getCode();
	static code = "profile";
	static usage = "profile [<user>]";
	static examples = [
		"example.caller",
		"example.selected"
	];
}

module.exports = ProfileCommand;
