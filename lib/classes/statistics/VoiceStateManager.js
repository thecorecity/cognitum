const { createModuleLogger } = require("../Utils");
const logger = createModuleLogger("voiceStatsManager");
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

	/** @type {{guilds: Object<boolean>, users: Object<boolean>, notTrackableUsers: Object<boolean>}} */
	#cache = {
		guilds: {},
		users: {},
		notTrackableUsers: {}
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
	 * Clear all the cached stored for the users and guilds.
	 */
	clearCache() {
		this.#cache = {
			guilds: {},
			users: {},
			notTrackableUsers: {}
		};
	}

	/**
	 * Clear cached states for the following user.
	 * @param {string} userId ID of the user to clear cache for.
	 */
	clearUserCache(userId) {
		delete this.#cache.users[userId];
		delete this.#cache.notTrackableUsers[userId];
	}

	/**
	 * Attach listeners to required DiscordJS events.
	 */
	#attachEventListeners() {
		this.client.on("voiceStateUpdate", async (...event) => {
			try {
				await this.#handleVoiceStateUpdate(...event);
			} catch (error) {
				logger.warn("Failed to handle voice state update.");
				console.warn(error);
			}
		});
	}

	/**
	 * Handle voice state event.
	 * @param {import("discord.js").VoiceState} before State before event happened.
	 * @param {import("discord.js").VoiceState} after State after event happened.
	 */
	async #handleVoiceStateUpdate(before, after) {
		// Prevent bots from voice statistics tracking
		if (before.member.user.bot) {
			const databaseMember = await GuildMemberModel.findOne({
				where: {
					id_user: before.member.id,
					id_guild: before.guild.id
				}
			});
			if (!databaseMember)
				return;
			// Destroy all records for this bot if available
			await VoiceStatisticsModel.destroy({
				where: {
					id_member: databaseMember.id
				}
			});
			return;
		}

		const databaseMember = await this.#resolveMember(after);

		// If member is not trackable, do not track their voice activity
		if (!databaseMember) {
			return;
		}

		if (before.channelId && !after.channelId)
			return await this.#onDisconnected(databaseMember);
		if (!before.channelId && after.channelId)
			return await this.#onJoined(databaseMember);
		if (before.channelId && after.channelId)
			return await this.#onUpdated(databaseMember);
		throw new Error("Unexpected state happened!");
	}

	/**
	 * Handle voice join.
	 * @param {GuildMemberModel} targetMember Database member instance.
	 * @return {Promise<void>}
	 */
	async #onDisconnected(targetMember) {
		if (!this.#storage.hasOwnProperty(targetMember.id))
			return;
		await this.constructor.#sendVoiceStatistic(targetMember, this.#storage[targetMember.id]);
	}

	/**
	 * Handle member join to voice channel.
	 * @param {GuildMemberModel} targetMember Database member instance.
	 * @return {Promise<void>}
	 */
	async #onJoined(targetMember) {
		this.#storage[targetMember.id] = new Date();
	}

	/**
	 * Handle member moved from channel to channel or just changed their state.
	 * @param {GuildMemberModel} targetMember Database member instance.
	 * @return {Promise<void>}
	 */
	async #onUpdated(targetMember) {
		if (!this.#storage.hasOwnProperty(targetMember.id))
			return void (this.#storage[targetMember.id] = new Date());
		await this.constructor.#sendVoiceStatistic(targetMember, this.#storage[targetMember.id]);
		this.#storage[targetMember.id] = new Date();
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
			id_member: targetMember.id,
			weight: this.#convertToTime(now - startDate),
			timestamp_begin: startDate.toISOString().replace("T", " ").substr(0, 19)
		});
	}

	/**
	 * Resolve guild member from database.
	 * @param {import("discord.js").VoiceState} afterState
	 * @return {Promise<GuildMemberModel|null>} Guild member model instance. If user is not trackable, returns null.
	 * @todo Invalidate cache after some time. Maybe with special caching manager.
	 */
	async #resolveMember(afterState) {
		const userId = afterState.member.user.id;

		if (!this.#cache.users.hasOwnProperty(userId)) {
			const [user] = await UserModel.findOrCreate({
				where: {
					id: userId
				}
			});
			this.#cache.users[userId] = true;

			// If user is not trackable, add it to the cache
			if (!user.trackable) {
				this.#cache.notTrackableUsers[userId] = true;
			}
		}

		if (!this.#cache.guilds.hasOwnProperty(afterState.guild.id)) {
			const [guild] = await GuildModel.findOrCreate({
				where: {
					id: afterState.guild.id
				}
			});
			this.#cache.guilds[guild.id] = true;
		}

		// If user is not trackable, return null
		if (!this.#isUserTrackable(userId.toString()))
			return null;

		const [member] = await GuildMemberModel.findOrCreate({
			where: {
				id_guild: afterState.guild.id,
				id_user: userId
			}
		});
		return member;
	}

	/**
	 * Check if user trackable. Works using cached values. Should be called after the user is resolved.
	 * @param {string} userId User ID.
	 * @return {boolean}
	 */
	#isUserTrackable(userId) {
		return !this.#cache.notTrackableUsers.hasOwnProperty(userId);
	}

	/**
	 * Get amount of entries of voice connections currently available in cache.
	 * @return {number}
	 */
	get storageSize() {
		return Object.keys(this.#storage).length;
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
