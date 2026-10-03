# Terms of Service

These Terms of Service ("Terms") govern your use of the **Cognitum** Discord bot ("the bot", "Cognitum"). By inviting
the bot to a server, or by interacting with it in any server where it is present, you agree to these Terms. If you do
not agree, do not use the bot — server admins can remove it at any time via the Discord Developer Portal integrations
page or by kicking it from the server.

See also the [Privacy Policy](./PRIVACY_POLICY.md) for details on what data is collected and why.

## 1. Description of the Bot

Cognitum is a statistics-collection and utility bot for Discord. It tracks message and voice activity per
server/channel/member to power leaderboards and profiles, and provides utility features such as reminders,
self-hosted documents/notes, nickname sanitization, and moderation event logging. Features are configured by each
server's administrators and may vary between servers.

## 2. Eligibility and Discord's Terms

You must comply with [Discord's Terms of Service](https://discord.com/terms) and
[Community Guidelines](https://discord.com/guidelines) while using the bot. You must meet Discord's minimum age
requirement to use Discord, and therefore to use the bot. The bot operates under
[Discord's Developer Terms of Service](https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service)
and [Developer Policy](https://discord.com/developers/docs/policies-and-agreements/developer-policy); nothing in
these Terms overrides those agreements.

## 3. Acceptable Use

When using the bot, you agree not to:

1. Use the bot to violate Discord's Terms of Service, Community Guidelines, or any applicable law;
2. Attempt to abuse, exploit, reverse-engineer for malicious purposes, or interfere with the operation of the bot or
   its infrastructure (including rate-limit evasion, spamming commands, or attempting to crash or overload it);
3. Use the bot to harass, threaten, or abuse others, or to store content (via the documents or reminders features)
   that is illegal, harmful, hateful, or infringes on someone else's rights;
4. Attempt to gain unauthorized access to the bot's source systems, database, or hosting infrastructure;
5. Use the `super`/owner-level commands or exploit bugs to gain privileges you have not been granted.

Server administrators are responsible for how the bot's configurable features (prefix, language, logging, nickname
sanitization, channel visibility, etc.) are set up and used within their own server.

## 4. User-Generated Content

Some features let you create content directly:

- **Documents**: notes created via the `doc` command, stored as submitted (text, optional title/image link).
- **Reminders**: text you provide via the `remind` command, stored until delivered.

You are solely responsible for anything you submit through these features. I do not review this content
proactively, but may remove it if it violates these Terms, Discord's policies, or applicable law, and may disable
the responsible account's access to the relevant features. You can delete documents yourself at any time; see the
[Privacy Policy](./PRIVACY_POLICY.md#retention-and-deletion) for current limitations around reminders.

## 5. Statistics and Opt-Out

The bot collects message/voice activity statistics to power leaderboards and profile commands, as described in the
[Privacy Policy](./PRIVACY_POLICY.md). This is opt-out per user via the tracking settings command
(`TrackingSettingsCommand`). Opting out stops new collection and deletes your previously collected statistics, as
described in the Privacy Policy.

## 6. No Warranty

The bot is provided **"as is" and "as available"**, without warranties of any kind, express or implied, including but
not limited to warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement. I do
not guarantee that:

- The bot will be available at all times, free of bugs, or uninterrupted;
- Statistics, leaderboards, or cached values will always be accurate or up to date;
- Reminders will be delivered at the exact requested time (delivery depends on bot uptime and Discord's own
  availability);
- Any particular feature will continue to exist in future versions.

## 7. Limitation of Liability

To the maximum extent permitted by law, I and any other contributors to the project shall not be liable for any
indirect, incidental, special, consequential, or punitive damages, or any loss of data, content, goodwill, or
profits, arising from your use of or inability to use the bot — including data loss caused by bugs, downtime,
server/database failures, or moderation actions taken by Discord or myself.

## 8. Moderation and Termination

I reserve the right, at my sole discretion and without prior notice, to:

- Refuse, restrict, or terminate the bot's service to any user, server, or group of users who violate these Terms;
- Remove the bot from any server, for any reason, including at the request of that server's owner or administrators;
- Disable specific commands or features globally or per-server.

Server administrators may remove the bot from their own server at any time through Discord.

## 9. Availability and Changes to the Bot

The bot is a hobby/community project and is offered free of charge. Features, commands, and behavior may change,
be added, or be removed at any time without notice. The bot may be taken offline temporarily for maintenance or
permanently discontinued at my discretion. No compensation is owed for discontinued features or downtime.

## 10. Open Source

Cognitum's source code is published at
[github.com/thecorecity/cognitum](https://github.com/thecorecity/cognitum) under the license in the repository's
[LICENSE](./LICENSE) file (Apache License 2.0). You may self-host your own instance of the bot under that license;
if you do, these Terms apply only to the instance I run, and you are responsible for providing your own Terms of
Service and Privacy Policy for any instance you host yourself.

The Apache License 2.0 covers the source code only — it does not grant any rights to the "Cognitum" name, icon, or
branding. If you self-host a fork or modified version, you may not present it as "Cognitum" or otherwise imply it is
the official bot; please run it under a different name/identity.

## 11. Changes to these Terms

Changes to these Terms are made in the bot's source repository and published as
[TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md). The version in the repository is always the authoritative and current
one. Continued use of the bot after an update constitutes acceptance of the revised Terms. You can see the dates and
summaries of changes in the git history.

## 12. Contact

For questions about these Terms, please contact me **through Discord** — join
[the Cognitum server](https://discord.gg/3S9UEm6) and reach out there or via DM, or open an issue on
[GitHub](https://github.com/thecorecity/cognitum/issues).
