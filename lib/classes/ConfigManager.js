const { log, fileName } = require("./Utils");
const path = require("path");
const fs = require("fs").promises;
const _ = require("lodash");

/**
 * # Configurations manager class
 *
 * Class to access all configuration files
 */
class ConfigManager {

	/**
	* Configuration files loaded from `/config/` directory.
	* @type {Object}
	*/
	static #configs = {};

	/**
	 * Initialization method. Its loading configuration files from `/config/default/` directory
	 * and checks, if files with same name exists in `/config/` direcotry.
	 * If some files is not exists in `/config/`, then the default ones are copied.
	 * @return {Promise<void>}
	 */
	static async initialize() {
		log("log", "Loading configuration files...");
		const configDir = path.resolve("config");
		const defaultConfigDir = path.resolve("config", ".default");

		let defaultConfigs = await fs.readdir(defaultConfigDir);
		let configs = await fs.readdir(configDir);

		for (let i = 0; i < defaultConfigs.length; i++) {
			if (!configs.includes(defaultConfigs[i])) {
				log("warn", `${defaultConfigs[i]} not found in "/config". Default ${defaultConfigs[i]} created.`);
				await fs.copyFile(
					path.resolve(defaultConfigDir, defaultConfigs[i]),
					path.resolve(configDir, defaultConfigs[i])
				);
			}
		}

		let blacklist = [".gitignore", ".default", "sequelize.js"];

		configs.forEach(config => {
			if (blacklist.includes(config))
				return;
			this.#configs[fileName(config)] = require(path.resolve(configDir, config));
		});
		log("success", "All configuration files loaded.");
	}

	/**
	 * Get configuration value by path. It uses lodash `at` methods to resolve path.
	 * @param {string} config Config object.
	 * @param {string} path Path to config entry.
	 * @return {null|string|any} Value from configuration values list. If value is not set then it returns null.
	 */
	static get(path) {
		return _.at(this.#configs, [path])[0] ?? null;
	}
}

module.exports = ConfigManager;
