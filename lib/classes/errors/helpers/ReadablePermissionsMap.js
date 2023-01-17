const { PermissionsBitField } = require("discord.js");

/**
 * Map of all permissions in Discord.js for translation. Key is a bitfield related to this permission and value is a
 * stringified permission name.
 * @type {Map<bigint, string>}
 */
const ReadablePermissionsMap = new Map([
	[PermissionsBitField.Flags.Administrator, "ADMINISTRATOR"],
	[PermissionsBitField.Flags.CreateInstantInvite, "CREATE_INSTANT_INVITE"],
	[PermissionsBitField.Flags.KickMembers, "KICK_MEMBERS"],
	[PermissionsBitField.Flags.BanMembers, "BAN_MEMBERS"],
	[PermissionsBitField.Flags.ManageChannels, "MANAGE_CHANNELS"],
	[PermissionsBitField.Flags.ManageGuild, "MANAGE_GUILD"],
	[PermissionsBitField.Flags.AddReactions, "ADD_REACTIONS"],
	[PermissionsBitField.Flags.ViewAuditLog, "VIEW_AUDIT_LOG"],
	[PermissionsBitField.Flags.PrioritySpeaker, "PRIORITY_SPEAKER"],
	[PermissionsBitField.Flags.Stream, "STREAM"],
	[PermissionsBitField.Flags.ViewChannel, "VIEW_CHANNEL"],
	[PermissionsBitField.Flags.SendMessages, "SEND_MESSAGES"],
	[PermissionsBitField.Flags.SendTTSMessages, "SEND_TTS_MESSAGES"],
	[PermissionsBitField.Flags.ManageMessages, "MANAGE_MESSAGES"],
	[PermissionsBitField.Flags.EmbedLinks, "EMBED_LINKS"],
	[PermissionsBitField.Flags.AttachFiles, "ATTACH_FILES"],
	[PermissionsBitField.Flags.ReadMessageHistory, "READ_MESSAGE_HISTORY"],
	[PermissionsBitField.Flags.MentionEveryone, "MENTION_EVERYONE"],
	[PermissionsBitField.Flags.UseExternalEmojis, "USE_EXTERNAL_EMOJIS"],
	[PermissionsBitField.Flags.ViewGuildInsights, "VIEW_GUILD_INSIGHTS"],
	[PermissionsBitField.Flags.Connect, "CONNECT"],
	[PermissionsBitField.Flags.Speak, "SPEAK"],
	[PermissionsBitField.Flags.MuteMembers, "MUTE_MEMBERS"],
	[PermissionsBitField.Flags.DeafenMembers, "DEAFEN_MEMBERS"],
	[PermissionsBitField.Flags.MoveMembers, "MOVE_MEMBERS"],
	[PermissionsBitField.Flags.UseVAD, "USE_VAD"],
	[PermissionsBitField.Flags.ChangeNickname, "CHANGE_NICKNAME"],
	[PermissionsBitField.Flags.ManageNicknames, "MANAGE_NICKNAMES"],
	[PermissionsBitField.Flags.ManageRoles, "MANAGE_ROLES"],
	[PermissionsBitField.Flags.ManageWebhooks, "MANAGE_WEBHOOKS"],
	[PermissionsBitField.Flags.ManageEmojisAndStickers, "MANAGE_EMOJIS"],
]);

module.exports = ReadablePermissionsMap;
