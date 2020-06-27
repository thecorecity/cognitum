const _ = require('lodash');
const fs = require('fs').promises;
const {log} = require('./Utils.js');

/**
 * # Configuration Class
 *
 * Configuration class for catching values from config files.
 */
class Config {

    /**
     * Configuration values loaded from configuration directory.
     * @type {Object}
     */
    static #values = {};

    /**
     * Initialization method. Its loading default configuration from `/config/config.example.json`. If this file is not
     * available then program will stop execution. After loading defaults it will load `/config/config.json` and
     * override values from default configuration file.
     * @return {Promise<void>}
     */
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

    /**
     * Get configuration value by path. It uses lodash `at` methods to resolve path.
     * @param {string} path Path to config entry.
     * @return {any|string} Value from configuration values list.
     */
    static get(path) {
        return _.at(this.#values, [path])[0] ?? path;
    }
}

module.exports = Config;