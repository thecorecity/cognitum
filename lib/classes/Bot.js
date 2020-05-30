const Config = require('./Config.js');
const Lang = require('./Lang.js');
const {Database} = require('./Database.js');

class Bot {

    async initialize() {
        await Config.initialize();
        await Lang.initialize();
        await Database.initialize();
    }

    async parseMessage() {

    }
}

module.exports = Bot;