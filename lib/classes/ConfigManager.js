const { createModuleLogger, fileName } = require("./Utils");
const logger = createModuleLogger("config");
const path = require("path");
const fs = require("fs").promises;
const _ = require("lodash");
const ignore = require("ignore");

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
		logger.info("Loading configuration files...");
		const configDir = path.resolve("config");
		const defaultConfigDir = path.resolve("config", ".default");

		/** @type {string[]} */
		let defaultConfigs = await fs.readdir(defaultConfigDir);
		/** @type {string[]} */
		let configs = await fs.readdir(configDir);

		for (let i = 0; i < defaultConfigs.length; i++) {
			if (!configs.includes(defaultConfigs[i])) {
				logger.warn(`${defaultConfigs[i]} not found in "/config". Default ${defaultConfigs[i]} created.`);
				await fs.copyFile(
					path.resolve(defaultConfigDir, defaultConfigs[i]),
					path.resolve(configDir, defaultConfigs[i])
				);
			}
		}
		let confignore = await fs
			.readFile(path.resolve("config", ".confignore"));
		confignore = confignore.toString();
		const ig = ignore().add(confignore);

		configs = await fs.readdir(configDir);
		configs = ig.filter(configs);

		configs.forEach(conf => {
			this.#configs[fileName(conf)] = require(path.resolve(configDir, conf));
		});
		logger.info("All configuration files loaded.");
	}

	/**
	 * Get configuration value by path. It uses lodash `at` methods to resolve path.
	 * @param {string} path Path to config entry.
	 * @return {null|string|any} Value from configuration values list. If value is not set then it returns null.
	 */
	static get(path) {
		return _.at(this.#configs, [path])[0] ?? null;
	}
}

module.exports = ConfigManager;
