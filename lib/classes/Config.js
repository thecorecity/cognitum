const _ = require('lodash');
const fs = require('fs').promises;
const {log} = require('./Utils.js');

class Config {
    /**
     * Default configuration
     * @type {Object}
     */
    static #values = {};

    static async initialize() {
        log("log", "Loading configuration...");
        const rootDir = process.cwd();
        const configDirectory = await fs.readdir(rootDir + "/config/");
        if (!configDirectory.includes('config.example.json')) {
            log("error", "Default configuration file not found!");
            process.exit();
        }
        let config = require(rootDir + "/config/config.example.json");
        if (configDirectory.includes('config.json')) {
            log("log", "Configuration rewrite found! Merging...");
            const configRewrite = require(rootDir + "/config/config.json");
            config = _.merge(config, configRewrite);
        }
        this.#values = config;
    }

    static get(path) {
        return _.at(this.#values, path)
    }
}

module.exports = Config;