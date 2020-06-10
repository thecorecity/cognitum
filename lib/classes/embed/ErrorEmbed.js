const DefaultEmbed = require('./DefaultEmbed.js');
const Config = require('../Config.js');

class ErrorEmbed extends DefaultEmbed {
    /**
     * @param {Message} message
     * @param {"guild"|"user"} thumbnailMode
     */
    constructor(message, thumbnailMode) {
        super(message, thumbnailMode);
        this.color = Config.get('cognitum.embedColors.error');
    }
}

module.exports = ErrorEmbed;