const BaseCommand = require("../../classes/base/BaseCommand");
const GuildCategory = require("../../categories/GuildCategory");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");

class WelcomeCommand extends BaseCommand {
	async run() {
		if (this.args.length === 1 && /^(enable|disable)$/.test(this.args[0]))
			return await this.toggleFeature(this.args[0] === "enable");
		if (this.args.length === 2) {
			if (!this.#subCommandMap.hasOwnProperty(this.args[0]))
				throw new Error("Incorrect command passed!");
			const targetID = /\d+/.exec(this.args[1])?.[0];
			if (!targetID || !isFinite(targetID))
				throw new Error("Failed to resolve Discord ID!");
			return await this.#subCommandMap[this.args[0]]?.(targetID);
		}
	}

	/**
	 * Enable or disable welcome feature.
	 * @param {boolean} state New state for feature.
	 * @return {Promise<DefaultEmbed>} Response.
	 */
	async toggleFeature(state) {
		const guildInstance = this.context.getDatabaseInstances().guild;
		await guildInstance.update("welcome_mode", state ? 1 : 0);
		const reply = new DefaultEmbed(this.context, "guild");
		reply.setTitle(
			this.resolveLang(`command.welcome.featureToggle.${state ? "on" : "off"}.title`)
		).setDescription(
			this.resolveLang(`command.welcome.featureToggle.${state ? "on" : "off"}.description`)
		);
		return reply;
	}

	/**
	 * Set role setting for welcome channel.
	 * @param {"manager"|"verified"} type Type of role to set.
	 * @param {string} id Discord ID of target role.
	 * @return {Promise<DefaultEmbed>}
	 */
	async setRole(type, id) {
		const targetRole = this.message.guild.roles.cache.find(role => role.id === id);
		if (!targetRole)
			throw new Error("Target role not found!");
		await this.context.getDatabaseInstances().guild.update(`welcome_${type}_role`, id);
		const reply = new DefaultEmbed(this.context, "guild");
		reply.setTitle(
			this.resolveLang(`command.welcome.${type}Updated.title`)
		).setDescription(
			this.resolveLang(`command.welcome.${type}Updated.description`, {
				roleID: id
			})
		);
		return reply;
	}

	/**
	 * Set welcome channel.
	 * @param {string} id Channel Discord ID.
	 * @return {Promise<DefaultEmbed>}
	 */
	async setWelcomeChannel(id) {
		const targetChannel = this.message.guild.channels.cache.find(
			channel => channel.id === id && channel.type === "text"
		);
		if (!targetChannel)
			throw new Error("Target channel not found!");
		await this.context.getDatabaseInstances().guild.update("welcome_channel", id);
		const reply = new DefaultEmbed(this.context, "guild");
		reply.setTitle(
			this.resolveLang("command.welcome.channelUpdated.title")
		).setDescription(
			this.resolveLang("command.welcome.channelUpdated.description", {
				channelID: id
			})
		);
		return reply;
	}

	/**
	 * Map of subcommands with ID as the second parameter. Used for calling function required for different commands.
	 */
	#subCommandMap = {
		manager: async id => {
			return await this.setRole("manager", id);
		},
		verified: async id => {
			return await this.setRole("verified", id);
		},
		channel: async id => {
			return await this.setWelcomeChannel(id);
		}
	};

	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		callerPermission: "ADMINISTRATOR",
		botPermission: "MANAGE_ROLES",
		arguments: {
			min: 1,
			max: 2,
			values: [
				[
					"channel",
					"manager",
					"verified",
					"enable",
					"disable"
				]
			]
		}
	};
	static code = "welcome";
	static category = GuildCategory.getCode();
	static usage = "welcome { enable | disable | manager <role> | verified <role> | channel <channel> }";
}

module.exports = WelcomeCommand;
