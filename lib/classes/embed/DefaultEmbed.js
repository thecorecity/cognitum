const Config = require('../Config.js');
const Lang = require('../Lang.js');
const {MessageEmbed} = require('discord.js');

class DefaultEmbed extends MessageEmbed {
    /**
     * @param {Message} message
     * @param {"guild"|"user"|"self"} thumbnailMode
     */
    constructor(message, thumbnailMode) {
        super();
        // TODO Select language set in database
        const lang = new Lang('en');
        this.title = lang.get('embed.defaultTitle');
        this.description = lang.get('embed.defaultDescription');
        this.thumbnail = {
            url: thumbnailMode === "guild"
                ? message.guild.iconURL
                : message.author.avatarURL
        };
        this.color = Config.get('cognitum.embedColors.default');
    }
}

module.exports = DefaultEmbed;