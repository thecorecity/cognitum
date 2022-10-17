const BaseCommand = require("../../classes/base/commands/BaseCommand");
const StatisticsCategory = require("../../categories/StatisticsCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const { PermissionsBitField } = require("discord.js");

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
			})
		].filter(part => part?.length).join("\n");
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
