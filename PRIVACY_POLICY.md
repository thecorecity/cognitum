# Privacy Policy

I obviously care a lot about privacy, so here is a clear outline of what is collected when you use my bot. I've included
the benefits as well as the risks so you can make informed decisions. I have structured it to match the categories of
the [Privacy Visualizer](https://rejectconvenience.com/privacy-visualizer/).

## Identifiers

**User, server and channel IDs:** Cognitum stores **Discord IDs** only — the public numeric identifiers for users,
guilds (servers), and channels. These are used to connect your settings and statistics to your account. It does **not**
collect usernames, e-mail addresses, avatar URLs, or IP addresses.

**Tracking opt-out flag (`trackable`):** a single flag on your user record that tells the bot to not store any
statistics coming from your Discord user ID.

## Usage Data

To collect and show the activity of each user on different servers/channels separately, the bot collects the following:

**Per-server settings (`GuildModel`):** configuration for each separate server, generally controlled by the server
admins.

1. `id`: the guild's Discord ID used to connect these settings to specific server;
2. `prefix`, `language`: command prefix and language settings configured by the server admins;
3. `nickname_mode`, `nickname_type`: settings controlling name sanitization feature for the server, which is configured
   by the server admin;
4. `logs_enabled`, `logs_public_channel`, `logs_private_channel`, `logs_*_event`: configuration for moderation logs
   feature;

**Connection of users to servers (`GuildMemberModel`):** stores connection between user and server, stores cached
stats assigned to this member.

1. `id_guild`, `id_user`: Discord server & user IDs this member is representing;
2. `message`, `voice`: cached totals of message/voice statistics for this specific member;

**Connection of channels to servers (`GuildChannelModel`):** one row per channel the bot tracks.

1. `id`, `id_guild`: Discord channel and server IDs;
2. `hidden`: per-channel setting for admin to hide it from appearing in leaderboards;
3. `message`: cached total of messages weight sent to this channel.

## Activity Tracking

To make it possible to show detailed stats per server/member/channel, each message weight and time spent in voice
channel are stored in separate tables. **This is opt-out per user** — see the tracking flag under
[Identifiers](#identifiers).

**Message statistics (`MessageStatisticsModel`):** collects statistics about sent text messages. **No message content
is stored!**

1. `id_member`: internal hidden ID connecting this message to the member (`GuildMemberModel`);
2. `id_channel`: Discord ID of the channel message was sent it;
3. `timestamp`: time this message was sent on;
4. `weight`: weight of the message (approximate amount of words, no actual message content is stored);
5. `cached`: flag to mark if this message is included into the cached values;

**Voice statistics (`VoiceStatisticsModel`):** collects time spent in voice channels. **No audio is ever recorded or
processed!**

1. `id_member`: internal hidden ID connecting this entry to the member (`GuildMemberModel`);
2. `timestamp_begin`: timestamp of starting the voice interaction;
3. `weight`: duration of the voice interaction;
4. `cached`: flag to mark if this interaction is included into the cached values.

## User Content

This content is manually created by the users: either by server admins for their servers to read (documents) or by the
users themselves (reminders). You may delete anything you create at any time, and data will be deleted immediately from
the database (with the reminder exception noted under Retention and deletion). In the case that you no longer have
access to the Discord account your content is stored under, see [Contact](#contact) — data can only be removed on
requests verified through that same account.

**Documents (`DocumentModel`):** self-hosted notes/wiki feature. Only stored when you deliberately create a document
with the `doc` command.

1. `id_member`: internal hidden ID connecting this message to the member (`GuildMemberModel`); this connection is used
   to determine which guild is this document created for and by which admin;
2. `name`: the document slug it should be requested by;
3. `title`: optional display title;
4. `content`: text of the document submitted during document creation or edit;
5. `image_url`: optional image link attached to the document;
6. `hidden`: setting configured by the author to make this document hidden from list of documents;

**Reminders (the only unit stored in `TaskModel`):** delivering your reminder at the requested time via the `remind`
command. Completed reminders are not currently auto-deleted (see Retention and deletion).

1. `code`: task type (`remind` for the Reminders);
2. `time`: when the reminder should fire;
3. `payload`: JSON data for the task: your Discord user ID and the reminder text you provided;
4. `completed`: whether the reminder has been delivered.

## Moderation Logs

If a server administrator enables the logging feature, the bot posts events (member joins/leaves, renames, kicks/bans,
message deletions/edits) to a channel in that server. Event content is being captured and sent into the Discord channel
admin have configured. **No logs are stored in the database.**

## What is NOT collected

- Message content (except documents/reminders you explicitly create)
- Voice audio in any form
- Usernames, avatars, e-mail addresses, IP addresses, or Discord tokens
- Data about users who never interact with the bot's guilds

## Purposes

All stored data serves one or more of:

1. Providing bot commands and features to the server and users that invoke them;
2. Computing activity statistics (opt-out per user);
3. Persisting user-created content (documents, reminders);
4. Enforcing permissions and configuration set by server administrators.

No data is used for advertising, profiling, machine-learning training, or any purpose beyond those listed.

## Data Sharing

Any non-public information that is collected is never sold, rented, or shared with anyone unless required by law or to
respond to a valid request from Discord (e.g. under their ToS), and I would notify affected users where legally
permitted.

The bot runs on infrastructure I operate; the database is not exposed publicly and is accessible only to the bot
application and myself for maintenance and support purposes.

**Bot listing/monitoring sites:** every 10 minutes, the bot reports its current **total server (guild) count** — a
single number, no guild IDs, names, or any other identifying data — to the bot-listing sites it is registered on
([top.gg](https://top.gg) and [bots.server-discord.com](https://bots.server-discord.com)), so they can display an
up-to-date server count on the bot's listing page. This is the same number already shown publicly on the top.gg badge
in the bot's [README](./README.md). No other data is sent to these sites.

## Retention and Deletion

- **When you opt out of tracking**, tracking stops immediately and your previously collected message/voice statistics
  and documents are deleted.
- **Documents** are deleted when you delete them.
- **Reminders** cannot currently be deleted by users, and completed reminders are not yet automatically purged from the
  database. Their text remains stored until removed on request (see below). This is a known limitation that will be
  addressed in a future version.
- **Currently, rows are not automatically removed when you leave a server or when the bot is removed from a server.**
  They consist of Discord IDs, configuration, and (for opted-in users) anonymous activity weights, and remain until
  I delete them — which you can request at any time via the contact below, to be fulfilled within 30 days. Automatic
  cleanup is planned for a future version.

## Changes to this Policy

Changes to this policy are made in the bot's source repository and published as
[PRIVACY_POLICY.md](./PRIVACY_POLICY.md). The version in the repository is always the authoritative and current one.
Continued use of the bot after an update constitutes acceptance of the revised policy. You can see the dates and the
summaries of changes in the git history.

## Contact

For privacy questions or data requests, please contact me **through Discord** — join
[the Cognitum server](https://discord.gg/3S9UEm6) and reach out there or via DM. All stored data is keyed to Discord
IDs, so reaching out from the Discord account in question is the only way I can verify that you are actually who you
claim to be before touching any data. Requests sent through any other channel (such as e-mail) cannot be verified
and therefore cannot be fulfilled.

If you have lost access to the Discord account in question, recovering it through Discord's own account recovery is the
only safe path to getting your data removed.
