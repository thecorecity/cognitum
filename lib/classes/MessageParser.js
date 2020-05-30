const CommandsRegistry = require('./CommandsRegistry.js');
const {Guild} = require('./Database.js');

class MessageParser {
    /**
     * @type {Message}
     */
    message;

    /**
     * @param {Message} message
     */
    constructor(message) {
        this.message = message;
    }

    run() {

    }

    #executeDirect = function () {

    };

    #parsePublic = function () {

    };
}