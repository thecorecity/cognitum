const BaseTask = require("../../base/BaseTask");
const { createModuleLogger, parseToBigIntOrDefault } = require("../../Utils");
const { GuildModel, GuildMemberModel, GuildChannelModel } = require("../../Database");
const StatisticsManager = require("../StatisticsManager");

const logger = createModuleLogger("guildCachingTask");

class GuildsCachingTask extends BaseTask {
	/**
	 * @type {CognitumClient}
	 */
	#client;

	/**
	 * @param {Cognitum.TaskQueueRunOptions} options
	 * @return {Promise<void>}
	 */
	async run(options) {
		this.#client = options.discordClient;

		if (this.payload.mode === GuildsCachingTask.modeSingleGuild) {
			if (!this.payload.id || !this.payload.id.length) {
				logger.warn("Task in single mode missing guild ID!");
				return;
			}

			// Calling the caching without interrupting the tasks queue
			this
				.#startCachingStatisticsForSingleGuild(this.payload.id)
				.then(this.#onActionComplete.bind(this))
				.catch(this.#onActionComplete.bind(this));

			return;
		}

		if (this.payload.mode === GuildsCachingTask.modeAllGuilds) {
			this.#startCachingStatisticsForMultipleGuilds()
				.then(this.#onActionComplete.bind(this))
				.catch(this.#onActionFailure.bind(this));

			return;
		}

		logger.warn(`Task is called in unknown mode: ${this.payload.mode}`);
	}

	async #startCachingStatisticsForSingleGuild(id) {
		logger.info(`Generating cache for guild ${id}`);

		await this.#generateCacheForGuild(id);
	}

	async #startCachingStatisticsForMultipleGuilds() {
		logger.info("Starting cache generating for multiple guilds...");

		const total = this.#client.guilds.cache.size;
		let index = 0;

		for (const guild of this.#client.guilds.cache.values()) {
			logger.info(`[${index + 1}/${total}] Generating cache for guild ${guild.id}`);

			await this.#generateCacheForGuild(guild.id.toString());
		}
	}

	/**
	 * Generate cache for the selected guild.
	 * @param {string} id Guild id to generate cache for.
	 * @return {Promise<void>}
	 */
	async #generateCacheForGuild(id) {
		const guild = await GuildModel.findOne({
			where: {
				id
			}
		});

		if (!guild) {
			throw new Error("Failed to find selected guild in the database!");
		}

		let lastCacheTimestamp = guild.cache_timestamp;

		if (typeof lastCacheTimestamp === "string") {
			lastCacheTimestamp = new Date(lastCacheTimestamp);

			if (isNaN(lastCacheTimestamp.getTime())) {
				lastCacheTimestamp = null;
			}
		}

		let nextCacheTimestamp = new Date();
		nextCacheTimestamp.setDate(nextCacheTimestamp.getDate() - GuildsCachingTask.#cacheIntervalInDays);

		/** @type {StatisticsManagerQueryOptions} */
		const options = {
			dateStart: lastCacheTimestamp instanceof Date ? lastCacheTimestamp : null,
			dateEnd: nextCacheTimestamp
		};

		/** @type {Object<number, Object>} */
		const membersStorage = {};
		/** @type {Object<string, Object>} */
		const channelsStorage = {};

		const memberMessagesStatistics = await StatisticsManager.queryTopMembersForGuild(id, options);
		const memberVoiceStatistics = await StatisticsManager.queryTopVoiceForGuild(id, options);
		const channelsMessagesStatistics = await StatisticsManager.queryTopChannelsForGuild(id, options);

		logger.debug(`Member messages: ${memberMessagesStatistics.length}`);
		logger.debug(`Member voice: ${memberVoiceStatistics.length}`);
		logger.debug(`Channel messages: ${channelsMessagesStatistics.length}`);

		for (const memberMessages of memberMessagesStatistics) {
			membersStorage[memberMessages.id_member] ??= {};
			membersStorage[memberMessages.id_member][GuildsCachingTask.#memberMessagesKey] = memberMessages.getDataValue("total_weight");
		}

		for (const memberVoice of memberVoiceStatistics) {
			membersStorage[memberVoice.id_member] ??= {};
			membersStorage[memberVoice.id_member][GuildsCachingTask.#memberVoiceKey] = memberVoice.getDataValue("total_weight");
		}

		for (const channelMessages of channelsMessagesStatistics) {
			channelsStorage[channelMessages.id_channel] ??= {};
			channelsStorage[channelMessages.id_channel][GuildsCachingTask.#channelMessagesKey] = channelMessages.getDataValue("total_weight");
		}

		for (const id in membersStorage) {
			const member = await GuildMemberModel.findOne({
				where: {
					id
				}
			});

			if (!member)
				continue;

			const storageEntry = membersStorage[id];

			if (storageEntry.hasOwnProperty(GuildsCachingTask.#memberMessagesKey)) {
				member.message = parseToBigIntOrDefault(member.message)
					+ parseToBigIntOrDefault(
						storageEntry[GuildsCachingTask.#memberMessagesKey]
					);
			}

			if (storageEntry.hasOwnProperty(GuildsCachingTask.#memberVoiceKey)) {
				member.voice = parseToBigIntOrDefault(member.voice)
					+ parseToBigIntOrDefault(
						storageEntry[GuildsCachingTask.#memberVoiceKey]
					);
			}

			await member.save();
		}

		for (let id in channelsStorage) {
			const channel = await GuildChannelModel.findOne({
				where: {
					id
				}
			});

			if (!channel)
				continue;

			const storageEntry = channelsStorage[id];

			if (storageEntry.hasOwnProperty(GuildsCachingTask.#channelMessagesKey)) {
				channel.message = parseToBigIntOrDefault(channel.message)
					+ parseToBigIntOrDefault(
						storageEntry[GuildsCachingTask.#channelMessagesKey]
					);
			}

			await channel.save();
		}

		guild.cache_timestamp = nextCacheTimestamp;

		await guild.save();
	}

	async #onActionComplete() {
		// Nothing to do for now.
	}

	async #onActionFailure(error) {
		logger.warn("Action failed!");
		console.error(error);
	}

	static modeSingleGuild = "single";
	static modeAllGuilds = "all";

	static #memberMessagesKey = Symbol("memberMessages");
	static #memberVoiceKey = Symbol("memberVoice");
	static #channelMessagesKey = Symbol("channelMessages");

	static #cacheIntervalInDays = 7;
}

module.exports = GuildsCachingTask;
