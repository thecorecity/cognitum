const { createModuleLog } = require("../Utils");
const log = createModuleLog("VoiceStateManager");
const { VoiceStatisticsModel, GuildMemberModel, UserModel, GuildModel } = require("../Database");
const BaseDiscordModule = require("../base/BaseDiscordModule");

/**
 * # Voice State Manager
 *
 * Class for tracking amount of voice activity time. Requires Discord client.
 *
 * @todo Split voice stats entries to prevent from pushing time exceeding TIME type limit (838:59:59).
 */
class VoiceStateManager extends BaseDiscordModule {
	/** @type {Object<Date>} */
	#storage = {};

	/** @type {{guilds: Object<boolean>, users: Object<boolean>}} */
	#cache = {
		guilds: {},
		users: {}
	};

	/**
	 * Initialize manager.
	 * @return {Promise<VoiceStateManager>}
	 */
	async initialize() {
		this.#attachEventListeners();
		return this;
	}

	/**
	 * Attach listeners to required DiscordJS events.
	 */
	#attachEventListeners() {
		this.client.on("voiceStateUpdate", async (...event) => {
			if (event[0].member.user.bot)
				return;
			try {
				await this.#handleVoiceStateUpdate(...event);
			} catch (error) {
				log("error", "Failed to handle voice state update.");
				console.error(error);
			}
		});
	}

	/**
	 * Handle voice state event.
	 * @param {module:"discord.js".VoiceState} before State before event happened.
	 * @param {module:"discord.js".VoiceState} after State after event happened.
	 */
	async #handleVoiceStateUpdate(before, after) {
		const databaseMember = await this.#resolveMember(after);
		if (before.channelID && !after.channelID)
			return await this.#onDisconnected(databaseMember);
		if (!before.channelID && after.channelID)
			return await this.#onJoined(databaseMember);
		if (before.channelID && after.channelID)
			return await this.#onUpdated(databaseMember);
		throw new Error("Unexpected state happened!");
	}

	/**
	 * Handle voice join.
	 * @param {GuildMemberModel} targetMember Database member instance.
	 * @return {Promise<void>}
	 */
	async #onDisconnected(targetMember) {
		if (!this.#storage.hasOwnProperty(targetMember["id"]))
			return;
		await this.constructor.#sendVoiceStatistic(targetMember, this.#storage[targetMember["id"]]);
	}

	/**
	 * Handle member join to voice channel.
	 * @param {GuildMemberModel} targetMember Database member instance.
	 * @return {Promise<void>}
	 */
	async #onJoined(targetMember) {
		this.#storage[targetMember["id"]] = new Date();
	}

	/**
	 * Handle member moved from channel to channel or just changed their state.
	 * @param {GuildMemberModel} targetMember Database member instance.
	 * @return {Promise<void>}
	 */
	async #onUpdated(targetMember) {
		if (!this.#storage.hasOwnProperty(targetMember["id"]))
			return void (this.#storage[targetMember["id"]] = new Date());
		await this.constructor.#sendVoiceStatistic(targetMember, this.#storage[targetMember["id"]]);
		this.#storage[targetMember["id"]] = new Date();
	}

	/**
	 * Push statistics to the voice stats table.
	 * @param {GuildMemberModel} targetMember Target member instance.
	 * @param {Date} startDate Starting date.
	 * @return {Promise<void>}
	 */
	static async #sendVoiceStatistic(targetMember, startDate) {
		const now = new Date();
		// Do not send stats lower then 1 second
		if (now - startDate < 1000)
			return;
		await VoiceStatisticsModel.create({
			id_member: targetMember["id"],
			weight: this.#convertToTime(now - startDate),
			timestamp_begin: startDate.toISOString().replace("T", " ").substr(0, 19)
		});
	}

	/**
	 * Resolve guild member from database.
	 * @param {module:"discord.js".VoiceState} afterState
	 * @return {Promise<GuildMemberModel>} Guild member model instance.
	 * @todo Invalidate cache after some time. Maybe with special caching manager.
	 */
	async #resolveMember(afterState) {
		if (!this.#cache.users.hasOwnProperty(afterState.member.id)) {
			const [user] = await UserModel.findOrCreate({
				where: {
					id: afterState.member.id
				}
			});
			this.#cache.users[user["id"]] = true;
		}
		if (!this.#cache.guilds.hasOwnProperty(afterState.guild.id)) {
			const [guild] = await GuildModel.findOrCreate({
				where: {
					id: afterState.guild.id
				}
			});
			this.#cache.guilds[guild["id"]] = true;
		}
		const [member] = await GuildMemberModel.findOrCreate({
			where: {
				id_guild: afterState.guild.id,
				id_user: afterState.id
			}
		});
		return member;
	}

	/**
	 * Convert difference in milliseconds to string represents TIME data type in database.
	 * @param {number} diff Difference between two {@link Date} objects.
	 * @return {string} String in format `00:00:00` represents amount of time.
	 */
	static #convertToTime(diff) {
		const result = [];
		result.unshift(Math.floor(diff / 1000));
		result.unshift(Math.floor(result[0] / 60));
		result.unshift(Math.floor(result[0] / 60));
		return result.map((value, index) => !index ? value : value % 60).join(":");
	}
}

module.exports = VoiceStateManager;
