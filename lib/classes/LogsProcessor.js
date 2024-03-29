const BaseDiscordModule = require("./base/BaseDiscordModule");
const DefaultEmbed = require("./embed/DefaultEmbed");
const { EventEmitter } = require("events");
const { escapeMarkdown: escape, formatDataSize, createModuleLogger, resolveUserName: username } = require("./Utils");
const { GuildModel } = require("./Database");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { ChannelType, AuditLogEvent } = require("discord-api-types/v10");
const logger = createModuleLogger("logsProcessor");

/**
 * # Logs Processor
 *
 * This module listening for guild events and sending logs messages to target channels.
 *
 * ## List of supported events
 *
 * + Joining
 * + Leaving
 * + Kicks (only with Audit Logs access)
 * + Bans (with executor and reason if Audit Logs access)
 * + Unbans (with executor and reason if Audit Logs access)
 * + Attachments logging
 * + Message updating
 * + Message deleting
 */
class LogsProcessor extends BaseDiscordModule {
	/**
	 * Event emitter used for proxying DiscordJS events to logs related events.
	 */
	#emitter = new EventEmitter();

	/**
	 * Initialize logs processor module.
	 * @return {Promise<LogsProcessor>}
	 */
	async initialize() {
		this.#loadDiscordListeners();
		this.#handleLogEvents();
		return this;
	}

	/**
	 * Set up proxy from DiscordJS events to logs events.
	 */
	#loadDiscordListeners() {
		this.client.on("guildMemberAdd", member => this.#emitter.emit("join", member));
		this.client.on("guildMemberRemove", this.#onGuildMemberRemove.bind(this));
		this.client.on("guildMemberUpdate", this.#onGuildMemberUpdate.bind(this));
		this.client.on("guildBanAdd", guildBanDetails => this.#onGuildBanUpdate("ban", guildBanDetails));
		this.client.on("guildBanRemove", guildBanDetails => this.#onGuildBanUpdate("unban", guildBanDetails));
		this.client.on("messageCreate", this.#onMessageCreate.bind(this));
		this.client.on("messageUpdate", this.#onMessageUpdate.bind(this));
		this.client.on("messageDelete", this.#onMessageDelete.bind(this));
	}

	/**
	 * Resolve member removing event. This method checking for audit logs to select which one event must be shown.
	 * @param {import("discord.js").GuildMember|import("discord.js").PartialGuildMember} member Target member.
	 * @return {Promise<any>}
	 */
	async #onGuildMemberRemove(member) {
		const now = new Date();

		if (member.partial)
			await member.fetch();

		if (!member.guild.members.me?.permissions.has(PermissionsBitField.Flags.ViewAuditLog))
			return this.#emitter.emit("left", member);

		/** @type {import("discord.js").GuildAuditLogs} */
		const logs = await member.guild.fetchAuditLogs();

		const entry = logs.entries.find(
			entry =>
				[AuditLogEvent.MemberKick, AuditLogEvent.MemberBanAdd, AuditLogEvent.MemberBanRemove]
					.includes(entry.action)
				&& entry.targetType === "User" && entry.target.id === member.id
				// #60 Prevent from duplicated kick event entries
				&& Math.abs(entry.createdAt.getTime() - now.getTime()) < LogsProcessor.#auditLogsLatencyMax
		);

		if (!entry)
			return this.#emitter.emit("left", member);

		if (entry.action === AuditLogEvent.MemberKick)
			return this.#emitter.emit("kick", member, entry);
	}

	/**
	 * Resolve attachment from message if available.
	 * @param {import("discord.js").Message} message Target message.
	 */
	async #onMessageCreate(message) {
		if (message.partial)
			await message.fetch();

		if (!message.attachments.size)
			return;

		message.attachments.forEach(attachment => this.#emitter.emit("msgimage", message, attachment));
	}

	/**
	 * Resolve ban/unban events with or without audit logs entries if available.
	 * @param {"ban"|"unban"} eventName Target event name.
	 * @param {import("discord.js").GuildBan} details Details about ban event.
	 * @return {Promise<void>}
	 */
	async #onGuildBanUpdate(eventName, details) {
		if (!details.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog))
			return void this.#emitter.emit(eventName, details.guild, details.user);

		const logs = await details.guild.fetchAuditLogs({
			type: eventName === "ban"
				? AuditLogEvent.MemberBanAdd
				: AuditLogEvent.MemberBanRemove
		});

		const entry = logs.entries.find(entry => entry.targetType === "User" && entry.target.id === details.user.id);

		if (!entry)
			return void this.#emitter.emit(eventName, details.guild, details.user);

		this.#emitter.emit(
			eventName + LogsProcessor.#eventNameAuditPostfix,
			details.guild,
			details.user,
			entry
		);
	}

	/**
	 * Resolve member update. This event might be used for members nicknames or roles changes.
	 * @param {import("discord.js").GuildMember|import("discord.js").PartialGuildMember} previousMember Previous member
	 *     state.
	 * @param {import("discord.js").GuildMember|import("discord.js").PartialGuildMember} currentMember Current member
	 *     state.
	 * @return {Promise<any>}
	 */
	#onGuildMemberUpdate(previousMember, currentMember) {
		if (previousMember.displayName !== currentMember.displayName)
			this.#emitter.emit("rename", previousMember, currentMember);
	}

	/**
	 * Resolve message delete.
	 * @param {import("discord.js").Message|import("discord.js").PartialMessage} message Target message.
	 */
	#onMessageDelete(message) {
		if (message.author.bot)
			return;
		this.#emitter.emit("msgdelete", message);
	}

	/**
	 * Resolve channel for logging.
	 * @param {"join"|"left"|"rename"|"kick"|"ban"|"unban"} eventName
	 * @param {...[any]} args List of arguments.
	 * @return {Promise<import("discord.js").GuildChannel>}
	 * + GuildChannel — if logging and target event enabled and logging channel specified.
	 * + null — if message sending is not required.
	 */
	async #resolveChannel(eventName, ...args) {
		/** @type {import("discord.js").Guild} */
		const guild = LogsProcessor.#guildResolver[eventName]?.(...args);

		const [guildInstance] = await GuildModel.findOrCreate({
			where: {
				id: guild.id
			}
		});

		if (eventName.endsWith(LogsProcessor.#eventNameAuditPostfix))
			eventName = eventName.slice(0, -LogsProcessor.#eventNameAuditPostfix.length);

		if (eventName === "unban")
			eventName = "ban";

		let channelType = ["msgdelete", "msgimage", "msgupdate"].includes(eventName) ? "private" : "public";

		if (
			!guildInstance.logs_enabled
			|| !guildInstance[`logs_${eventName}_event`]
			|| !guildInstance[`logs_${channelType}_channel`]
		) {
			return null;
		}

		return guild.channels.cache.get(guildInstance[`logs_${channelType}_channel`].toString());
	}

	/**
	 * Resolve message update event.
	 * @param {import("discord.js").Message|import("discord.js").PartialMessage} prev Previous message state.
	 * @param {import("discord.js").Message|import("discord.js").PartialMessage} curr Current message state.
	 * @return {Promise<void>}
	 */
	async #onMessageUpdate(prev, curr) {
		if (prev.author.bot || prev.content === curr.content)
			return;

		this.#emitter.emit("msgupdate", prev, curr);
	}

	/**
	 * Set up internal logs events.
	 */
	#handleLogEvents() {
		for (const eventName in LogsProcessor.#eventMessageRenderer) {
			if (!LogsProcessor.#eventMessageRenderer.hasOwnProperty(eventName))
				continue;

			this.#emitter.on(eventName, (...args) => this.#handleEvent(eventName, ...args));
		}
	}

	/**
	 * Handle target event by event name and arguments.
	 * @param {string} eventName Log event name.
	 * @param {any} args List of arguments passed for this event.
	 * @return {Promise<void>}
	 */
	async #handleEvent(eventName, ...args) {
		const channel = await this.#resolveChannel(eventName, ...args);

		if (!channel)
			return;

		let logMessage;

		try {
			logMessage = LogsProcessor.#eventMessageRenderer[eventName]?.(...args);
		} catch (e) {
			logger.warn(`Failed to render log message for event ${eventName}: ${e.message}`);
			logger.warn(e);
			return;
		}

		// Only default text channels are allowed to use as logging channels
		if (channel.type !== ChannelType.GuildText)
			return;

		try {
			/**
			 * @type {Partial<import('discord.js').MessagePayload>}
			 */
			const sendOptions = {};

			// If string resolved then send this string as a log message
			if (typeof logMessage === "string")
				sendOptions.content = logMessage;

			// If embed passed then send the embed
			if (logMessage instanceof EmbedBuilder)
				sendOptions.embeds = [logMessage];

			await channel.send(sendOptions);
		} catch (error) {
			logger.warn("Unable to send message to the log channel! Disabling logging feature for the guild. Reason: " + error);

			await LogsProcessor.#tryDisableLoggingFeatureForGuild(channel.guild);
		}
	}

	/**
	 * @param {import('discord.js').Guild} guild
	 * @return {Promise<void>}
	 */
	static async #tryDisableLoggingFeatureForGuild(guild) {
		await GuildModel.update(
			{
				logs_enabled: 0
			},
			{
				where: {
					id: guild.id.toString()
				}
			}
		);
	}

	/**
	 * Methods map for rendering event messages.
	 * @type {Record<string, function>}
	 */
	static #eventMessageRenderer = {
		/**
		 * Render join event.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @return {string} Rendered string of member join.
		 */
		join: member => `:inbox_tray: [JOIN] | ${escape(`ID: ${member.id}`)} | ${escape(username(member.user.tag))}`,
		/**
		 * Render left event.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @return {string} Rendered string of member left.
		 */
		left: member => `:outbox_tray: [LEAVE] | ${escape(`ID: ${member.id}`)} | ${escape(username(member.user.tag))}`,
		/**
		 * Render rename event.
		 * @param {import("discord.js").GuildMember} prev Previous member state.
		 * @param {import("discord.js").GuildMember} next Updated member state.
		 * @return {string} Rendered string of member rename.
		 */
		rename: (prev, next) => `:abc: [RENAME] | ${escape(`ID: ${prev.id}`)} | `
			+ `${escape(prev.nickname ?? prev.user.username)} → ${escape(next.nickname ?? next.user.username)}`,
		/**
		 * Render ban event with executor and reason available.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @param {import("discord.js").User} user Target user.
		 * @return {string} Rendered string of user banned from guild.
		 */
		ban: (guild, user) => `:hammer: [BAN] | ${escape(`ID: ${user.id}`)}`
			+ ` | ${escape(username(user.tag))}`,
		/**
		 * Render ban event without executor and reason available.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @param {import("discord.js").User} user Target user.
		 * @param {import("discord.js").GuildAuditLogsEntry} entry Audit logs entry represents this event.
		 * @return {string} Rendered string of user banned from guild.
		 */
		banAudit: (guild, user, entry) => `:hammer: [BAN] by ${escape(username(entry.executor.tag))} with` + (entry.reason?.length
			? ` reason ${escape(entry.reason)}` : " no reason") + ` | ${escape(`ID: ${user.id}`)} | ${escape(username(user.tag))}`,
		/**
		 * Render unban event without executor and reason available.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @param {import("discord.js").User} user Target user.
		 * @return {string} Rendered string of user unbanned from guild.
		 */
		unban: (guild, user) => `:peace: [UNBAN] | ${escape(`ID: ${user.id}`)}`
			+ ` | ${escape(username(user.tag))}`,
		/**
		 * Render unban event with executor and reason available.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @param {import("discord.js").User} user Target user.
		 * @param {import("discord.js").GuildAuditLogsEntry} entry Audit logs entry represents this event.
		 * @return {string} Rendered string of user banned from guild.
		 */
		unbanAudit: (guild, user, entry) => `:peace: [UNBAN] by ${escape(username(entry.executor.tag))}`
			+ ` | ${escape(`ID: ${user.id}`)} | ${escape(username(user.tag))}`,
		/**
		 * Render kick event with executor and reason if reason is passed.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @param {import("discord.js").GuildAuditLogsEntry} entry Target audit logs entry with reason and executor.
		 * @return {string} Rendered string of member kicked from guild with executor and possible reason.
		 */
		kick: (member, entry) => `:boot: [KICK] by ${escape(username(entry.executor.tag))} with` +
			(entry.reason?.length
				? ` reason ${escape(entry.reason)}`
				: " no reason") +
			` | ${escape(`ID: ${member.id}`)} | ${escape(username(member.user.tag))}`,
		/**
		 * Render new attachment event.
		 * @param {import("discord.js").Message} message Target message.
		 * @param {import("discord.js").MessageAttachment} attachment Target attachment.
		 * @return {DefaultEmbed} Rendered message for target event.
		 */
		msgimage: (message, attachment) => {
			const embed = new DefaultEmbed(message, "user"),
				lang = embed.lang;

			embed
				.setTitle(
					lang.get("embed.logs.attachment.title")
				)
				.setDescription(
					lang.get("embed.logs.attachment.description", {
						filename: escape(attachment.name),
						size: formatDataSize(attachment.size, 2),
						link: attachment.url,
						messageLink: message.url
					})
				)
				.setFooter({
					text: username(message.author.tag),
					iconURL: message.author.avatarURL()
				})
				.setThumbnail(null);

			return embed;
		},
		/**
		 * Render message update event.
		 * @param {import("discord.js").Message} prev Previous message state.
		 * @param {import("discord.js").Message} curr Current message state.
		 * @return {DefaultEmbed} Rendered message for target event.
		 */
		msgupdate: (prev, curr) => {
			const embed = new DefaultEmbed(prev, "user"),
				lang = embed.lang;

			embed
				.setTitle(
					lang.get("embed.logs.messageUpdate.title")
				)
				.setDescription(
					prev.content ?? ""
				)
				.setFooter({
					text: username(prev.author.tag),
					iconURL: prev.author.avatarURL()
				})
				.addFields({
					name: lang.get("embed.logs.messageUpdate.info.name"),
					value: lang.get("embed.logs.messageUpdate.info.value", {
						messageLink: curr.url,
						messageUpdatedAt: lang.formatDate(curr.editedAt)
					})
				})
				.setTimestamp(curr.editedTimestamp)
				.setThumbnail(null);

			return embed;
		},
		/**
		 * Render message delete event.
		 * @param {import("discord.js").Message} message Message state before deletion.
		 * @return {DefaultEmbed} Rendered message for target event.
		 */
		msgdelete: message => {
			const embed = new DefaultEmbed(message, "user"),
				lang = embed.lang;

			embed
				.setTitle(
					lang.get("embed.logs.messageDelete.title")
				)
				.setDescription(
					message.content || "(Empty)"
				)
				.setFooter({
					text: username(message.author.tag),
					iconURL: message.author.avatarURL()
				})
				.addFields(
					{
						name: lang.get("embed.logs.messageDelete.info.name"),
						value: lang.get("embed.logs.messageDelete.info.value", {
							channelId: message.channel.id
						})
					},
				)
				.setTimestamp(message.editedTimestamp)
				.setThumbnail(null);

			return embed;
		}
	};

	/**
	 * Methods map for resolving guild from events.
	 * @type {Record<string, function>}
	 */
	static #guildResolver = {
		/**
		 * Resolve guild from join event arguments.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @return {import("discord.js").Guild} Resolved guild from join event.
		 */
		join: member => member.guild,
		/**
		 * Resolve guild from left event arguments.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @return {import("discord.js").Guild} Resolved guild from left event.
		 */
		left: member => member.guild,
		/**
		 * Resolve guild from rename event arguments.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @return {import("discord.js").Guild} Resolved guild from rename event.
		 */
		rename: member => member.guild,
		/**
		 * Resolve guild from ban event arguments.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @return {import("discord.js").Guild} Resolved guild from ban event.
		 */
		ban: guild => guild,
		/**
		 * Resolve guild from ban event arguments.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @return {import("discord.js").Guild} Resolved guild from ban event.
		 */
		banAudit: guild => guild,
		/**
		 * Resolve guild from unban event arguments.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @return {import("discord.js").Guild} Resolved guild from unban event.
		 */
		unban: guild => guild,
		/**
		 * Resolve guild from unban event arguments.
		 * @param {import("discord.js").Guild} guild Target guild.
		 * @return {import("discord.js").Guild} Resolved guild from unban event.
		 */
		unbanAudit: guild => guild,
		/**
		 * Resolve guild from kick event arguments.
		 * @param {import("discord.js").GuildMember} member Target member.
		 * @return {import("discord.js").Guild} Resolved guild from kick event.
		 */
		kick: member => member.guild,
		/**
		 * Resolve guild from new message with attachment.
		 * @param {import("discord.js").Message} message Target member.
		 * @return {import("discord.js").Guild} Resolved guild from message event.
		 */
		msgimage: message => message.guild,
		/**
		 * Resolve guild from updated message.
		 * @param {import("discord.js").Message} message Target member.
		 * @return {import("discord.js").Guild} Resolved guild from message update event.
		 */
		msgupdate: message => message.guild,
		/**
		 * Resolve guild from deleted message.
		 * @param {import("discord.js").Message} message Target member.
		 * @return {import("discord.js").Guild} Resolved guild from message delete event.
		 */
		msgdelete: message => message.guild
	};

	/**
	 * Postfix used for events which uses audit log for getting more details.
	 * @type {string}
	 */
	static #eventNameAuditPostfix = "Audit";

	/**
	 * Maximal amount of time between event happened and audit log entry found.
	 * @type {number}
	 */
	static #auditLogsLatencyMax = 10000;

	/**
	 * Listen for internal event.
	 * @param {string} event
	 * @param {function} eventHandler
	 */
	on(event, eventHandler) {
		this.#emitter.addListener(event, eventHandler);
	}

	/**
	 * Remove listener from internal event.
	 * @param {string} event
	 * @param {function} eventHandler
	 */
	off(event, eventHandler) {
		this.#emitter.removeListener(event, eventHandler);
	}
}

module.exports = LogsProcessor;
