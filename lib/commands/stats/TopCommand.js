const BaseCommand = require("../../classes/base/commands/BaseCommand");
const StatisticsCategory = require("../../categories/StatisticsCategory");
const ArgumentError = require("../../classes/errors/ArgumentError");
const DefaultEmbed = require("../../classes/embed/DefaultEmbed");
const StatisticsManager = require("../../classes/statistics/StatisticsManager");
const OrderedList = require("../../classes/content/OrderedList");
const { formatTimeString, createModuleLogger, parseToBigIntOrDefault } = require("../../classes/Utils");
const { GuildChannelModel, GuildMemberModel } = require("../../classes/Database");
const { Op } = require("sequelize");

const logger = createModuleLogger("topCommand");

class TopCommand extends BaseCommand {
	#selectedPage = 1;

	async run() {
		if (this.args.length === 2) {
			this.#selectedPage = isFinite(parseInt(this.args[1]))
				? parseInt(this.args[1])
				: 1;
		}

		if (["channel", "channels", "ch"].includes(this.args[0]))
			return await this.#generateChannelsList();

		if (["voice", "v"].includes(this.args[0]))
			return await this.#generateVoiceList();

		if (["user", "users", "u"].includes(this.args[0]))
			return await this.#generateMembersList();

		throw new ArgumentError("value", {
			argumentPassed: this.args[0]
		});
	}

	/**
	 * Send typing event to the current channel.
	 * @return {Promise<true>} Always return true.
	 */
	async #sendTypingEvent() {
		await this.context.channel.sendTyping();
		return true;
	}

	/**
	 * @return {Date|null}
	 */
	#fetchLastCacheTimestamp() {
		let timestamp = this.context.models.guild.cache_timestamp;

		try {
			if (!(timestamp instanceof Date)) {
				timestamp = new Date(timestamp);
			}
		} catch (e) {
			// Nothing to do.
		}

		return timestamp instanceof Date && !isNaN(timestamp.getTime()) ? timestamp : null;
	}

	/**
	 * Generate and return the report about channels activity.
	 * @return {Promise<DefaultEmbed>} Embed for sending to current channel.
	 */
	async #generateChannelsList() {
		await this.#sendTypingEvent();

		const cachedTo = this.#fetchLastCacheTimestamp();

		let topChannels = (await new StatisticsManager(this.message).queryTopChannels({ dateStart: cachedTo }))
			.map(element => ({
				id: element.id_channel,
				weight: element.getDataValue("total_weight")
			}));

		if (cachedTo) {
			/** @type {Object<string,bigint>} */
			const cachedWeights = {};

			const channels = await GuildChannelModel.findAll({
				where: {
					id_guild: this.context.models.guild.id.toString(),
					hidden: 0,
					// Do not fetch channels with empty cached values
					message: {
						[Op.gt]: 0
					}
				}
			});

			if (channels && channels.length) {
				for (const channelModel of channels) {
					cachedWeights[channelModel.id] = parseToBigIntOrDefault(channelModel.message);
				}
			}

			topChannels = topChannels.map(channel => {
				if (cachedWeights.hasOwnProperty(channel.id)) {
					const weight = cachedWeights[channel.id];
					delete cachedWeights[channel.id];

					channel.weight += weight;
				}
			});

			for (let [id, weight] of Object.entries(cachedWeights)) {
				topChannels.push({ id, weight });
			}
		}

		topChannels.sort(TopCommand.#sortByWeight);

		const { start, end } = this.#calculatePageOffsets(topChannels);

		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);

		for (let index = start; index < end; index++) {
			let channel = topChannels[index];
			list.push(`<#${channel.id}> [${channel.weight}]`);
		}

		const areMissingChannelsFound = await this.#detectMissingChannels(topChannels);

		const embed = this.#createBaseEmbed("channels", { guildName: this.message.guild.name });
		embed.setDescription(
			list.length
				? list.toString()
				: this.resolveLang("command.top.statsEmpty.channels")
		);

		if (areMissingChannelsFound) {
			embed.setFooter({
				text: this.resolveLang("command.top.footer.hiddenChannels")
			});
		}

		return embed;
	}

	/**
	 * Check which channels should be hidden from the list.
	 * @param {{id: string}[]} statisticsModels
	 * @returns {Promise<boolean>}
	 */
	async #detectMissingChannels(statisticsModels) {
		/** @type {string[]} */
		const channelIdsToRemove = [];

		const guild = this.message.guild;

		for (const entry of statisticsModels) {
			const channelId = entry.id;

			let channel = guild.channels.cache.get(channelId);

			try {
				if (!channel)
					channel = await guild.channels.fetch(channelId);
			} catch (ignored) {
				// Do nothing, channel will be treated as missing.
			}

			if (!channel)
				channelIdsToRemove.push(channelId);
		}

		if (channelIdsToRemove.length) {
			this
				.#hideChannels(channelIdsToRemove)
				.then(() => {
					logger.debug(`Hidden ${channelIdsToRemove.length} channels for ${guild.id}.`);
				})
				.catch(error => {
					logger.warn("Failed to hide channels!");
					logger.warn(error);
				});
		}

		return !!channelIdsToRemove.length;
	}

	/**
	 * @param {string[]} channelIdsToRemove
	 * @returns {Promise<void>}
	 */
	async #hideChannels(channelIdsToRemove) {
		for (const channelId of channelIdsToRemove) {
			const channelModel = await GuildChannelModel.findOne({
				where: {
					id: channelId.toString(),
				}
			});

			if (!channelModel)
				continue;

			channelModel.hidden = 1;
			await channelModel.save();
		}
	}

	/**
	 * Fetch the amounts cached for members.
	 * @param {"message"|"voice"} weightType Type of the weight to return.
	 * @return {Promise<Object<string, bigint>>}
	 */
	async #fetchCachedWeightForMember(weightType) {
		/** @type {Object<string,bigint>} */
		const weights = {};
		const guildId = this.context.message.guild.id.toString();

		const members = await GuildMemberModel.findAll({
			where: {
				id_guild: guildId,
				// Do not fetch members without cached values
				[weightType]: {
					[Op.gt]: 0
				}
			}
		});

		if (members && members.length) {
			for (const memberModel of members) {
				weights[memberModel.id_user.toString()] = parseToBigIntOrDefault(memberModel[weightType]);
			}
		}

		return weights;
	}

	/**
	 * Generate and return the report about voice activity.
	 * @return {Promise<DefaultEmbed>} Embed for sending to current channel.
	 */
	async #generateVoiceList() {
		await this.#sendTypingEvent();

		const cachedTo = this.#fetchLastCacheTimestamp();

		let topVoice = (await new StatisticsManager(this.message).queryTopVoice({ dateStart: cachedTo }))
			.map(entry => ({
				id: entry.GuildMemberModel.id_user.toString(),
				weight: parseToBigIntOrDefault(entry.getDataValue("total_weight"))
			}));

		if (cachedTo) {
			const cachedWeights = await this.#fetchCachedWeightForMember(TopCommand.#weightTypeVoice);

			topVoice = topVoice.map(member => {
				if (cachedWeights.hasOwnProperty(member.id)) {
					const weight = cachedWeights[member.id];
					delete cachedWeights[member.id];

					member.weight += weight;

					return member;
				}
			});

			for (let [id, weight] of Object.entries(cachedWeights)) {
				topVoice.push({ id, weight });
			}

			topVoice.sort(TopCommand.#sortByWeight);
		}

		const { start, end } = this.#calculatePageOffsets(topVoice);

		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);

		for (let index = start; index < end; index++) {
			const member = topVoice[index];
			list.push(`<@${member.id}> ${formatTimeString(parseInt(member.weight.toString()))}`);
		}

		return this
			.#createBaseEmbed("voice", { guildName: this.message.guild.name })
			.setDescription(
				list.length
					? list.toString()
					: this.resolveLang("command.top.statsEmpty.voice")
			);
	}

	/**
	 * Generate and return report with members activity.
	 * @return {Promise<DefaultEmbed>} Embed for sending to current channel.
	 */
	async #generateMembersList() {
		await this.#sendTypingEvent();

		const cachedTo = this.#fetchLastCacheTimestamp();

		let topMembers = (await new StatisticsManager(this.message).queryTopMembers({ dateStart: cachedTo }))
			.map(entry => ({
				id: entry.GuildMemberModel.id_user.toString(),
				weight: parseToBigIntOrDefault(entry.getDataValue("total_weight"))
			}));

		if (cachedTo) {
			const cachedWeights = await this.#fetchCachedWeightForMember(TopCommand.#weightTypeMessage);

			topMembers = topMembers.map(member => {
				if (cachedWeights.hasOwnProperty(member.id)) {
					const weight = cachedWeights[member.id];
					delete cachedWeights[member.id];

					member.weight += weight;

					return member;
				}
			});

			for (let [id, weight] of Object.entries(cachedWeights)) {
				topMembers.push({ id, weight });
			}
		}

		topMembers.sort(TopCommand.#sortByWeight);

		const { start, end } = this.#calculatePageOffsets(topMembers);

		const list = new OrderedList();
		list.startPoint = start + 1;
		list.setStyler(OrderedList.STYLER_DOTTED);

		for (let index = start; index < end; index++) {
			let member = topMembers[index];
			list.push(`<@${member.id}> [${member.weight}]`);
		}

		return this
			.#createBaseEmbed("members", { guildName: this.message.guild.name })
			.setDescription(
				list.length
					? list.toString()
					: this.resolveLang("command.top.statsEmpty.members")
			);
	}

	/**
	 * Generate base embed for filling with list.
	 * @param {"channels"|"voice"|"members"|"channelMembers"} listType Type of list for selected embed.
	 * @param {Object<string, string>} fillOptions Options for replacement on embed title.
	 * @return {DefaultEmbed} Generated embed.
	 */
	#createBaseEmbed(listType, fillOptions) {
		const embed = new DefaultEmbed(this.context, "guild");
		embed.setTitle(
			this.resolveLang(`command.top.listTitle.${listType}`, fillOptions)
		);
		return embed;
	}

	get #selectedOffsetStart() {
		return (this.#selectedPage - 1) * TopCommand.#pageSize;
	}

	get #selectedOffsetEnd() {
		return this.#selectedPage * TopCommand.#pageSize;
	}

	/**
	 * Calculate page offsets based on result.
	 * @param {Array} array List of activities for calculating page offsets.
	 * @return {{start: number, end: number}}
	 */
	#calculatePageOffsets(array) {
		if (this.#selectedOffsetStart >= array.length)
			this.#selectedPage = 1;
		return {
			start: this.#selectedOffsetStart,
			end: Math.min(this.#selectedOffsetEnd, array.length)
		};
	}

	/**
	 *
	 * @param {{weight: BigInt}} recordA
	 * @param {{weight: BigInt}} recordB
	 */
	static #sortByWeight(recordA, recordB) {
		return recordB.weight === recordA.weight
			? 0
			: (
				recordB.weight > recordA.weight
					? 1
					: -1
			);
	}

	static #weightTypeMessage = "message";
	static #weightTypeVoice = "voice";

	static code = "top";
	static category = StatisticsCategory.getCode();
	/**
	 * @type {Cognitum.ContextValidatorOptions}
	 */
	static validators = {
		arguments: {
			min: 1,
			max: 2,
			values: [/^(ch(annels?)?|v(oice)?|u(sers?)?)$/, /^\d+$/]
		}
	};
	static usage = "top <list_type> [<page>]";
	static examples = [
		"example.channels",
		"example.voiceShort",
		"example.usersPaged"
	];

	static #pageSize = 20;
}

module.exports = TopCommand;
