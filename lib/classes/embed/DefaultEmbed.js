const Config = require('../Config.js');
const Lang = require('../Lang.js');
const {MessageEmbed} = require('discord.js');
/**
 * Available thumbnail modes.
 * @typedef {"guild"|"user"|"self"} ThumbnailMode
 */
/**
 * # Default Embed
 *
 * Default embed with sample title, description and resolved thumbnail.
 */
class DefaultEmbed extends MessageEmbed {
    /**
     * Private lang instance.
     * @type {Lang}
     */
    lang;

    /**
     * Map of functions for receiving different icons types for default embed.
     * @type {Object<ThumbnailMode, function: string>}
     */
    static #resolveThumbnail = {
        /**
         * Get guild icon from message guild.
         * @param {Message} message Target message.
         * @return {string|null} Picture URL.
         */
        guild(message) {
            return message.guild.iconURL();
        },
        /**
         * Get author avatar from message.
         * @param {Message} message Target message.
         * @return {string} Picture URL.
         */
        user(message) {
            return message.author.avatarURL();
        },
        /**
         * Get bot avatar.
         * @param {Message} message Target message.
         * @return {string} Picture URL.
         */
        self(message) {
            return message.client.user.avatarURL();
        }
    }

    /**
     * @param {Message} message Target message. Required for icons resolving.
     * @param {ThumbnailMode} [thumbnailMode] (Optional) Thumbnail mode. Default value: "self".
     */
    constructor(message, thumbnailMode= "self") {
        super();
        // TODO Select language set in database
        this.lang = new Lang('en');
        this.title = this.lang.get('embed.default.title');
        this.description = this.lang.get('embed.default.description');
        this.thumbnail = {
            url: DefaultEmbed.#resolveThumbnail[thumbnailMode]?.(message) ?? message.client.user.avatarURL()
        };
        this.color = Config.get('cognitum.embedColors.default');
    }
}

module.exports = DefaultEmbed;