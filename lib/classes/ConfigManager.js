const { createModuleLogger, fileName, checkObjectKeySafety } = require("./Utils");
const logger = createModuleLogger("config");
const path = require("path");
const fs = require("fs").promises;
const _ = require("lodash");
const ignore = require("ignore");

/**
 * # Configurations manager class
 *
 * Class to access all configuration files.
 *
 * @example
 * // Usage without initialization of new instance
 * const value = ConfigManager.get("preference.path.to.value");
 *
 * @example
 * // Usage with instance initialization
 * const config = new ConfigManager("path.to.values");
 * let value1 = config.get("value1");
 * // Similar to
 * value1 = ConfigManager.get("path.to.values.value1");
 *
 * @example
 * // Extending instances
 * const settings = new ConfigManager("settings");
 * const names = settings.extend("names");
 * let botName = names.get("bot");
 * // Similar to
 * botName = ConfigManager.get("settings.names.bot");
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

		const directory = path.resolve("config");
		const defaultDirectory = path.resolve("config", ".default");

		/** @type {string[]} */
		let defaultConfigs = await fs.readdir(defaultDirectory);
		/** @type {string[]} */
		let configs = await fs.readdir(directory);

		for (let i = 0; i < defaultConfigs.length; i++) {
			if (!configs.includes(defaultConfigs[i])) {
				logger.warn(`${defaultConfigs[i]} not found in "/config". Default ${defaultConfigs[i]} created.`);
				await fs.copyFile(
					path.resolve(defaultDirectory, defaultConfigs[i]),
					path.resolve(directory, defaultConfigs[i])
				);
			}
		}

		const configIgnore = ignore().add(
			(await fs.readFile(
				path.resolve("config", ".confignore")
			)).toString()
		);

		configs = await fs.readdir(directory);
		configs = configIgnore.filter(configs);

		configs.forEach(configFullName => {
			const configKey = fileName(configFullName);
			if (!checkObjectKeySafety(configKey))
				return void logger.warn(`Invalid file name for config: ${configKey}! Config file skipped!`);
			this.#configs[configKey] = require(path.resolve(directory, configFullName));
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

	/**
	 * Base path for resolving values using {@link ConfigManager} instance.
	 * @type {string}
	 */
	#basePath = "";

	/**
	 * @param {string} path Base path for configuration value.
	 */
	constructor(path) {
		this.#basePath = path;
	}

	/**
	 * Base path of current {@link ConfigManager} instance.
	 * @return {string}
	 */
	get basePath() {
		return this.#basePath;
	}

	/**
	 * Get configuration value by path. Path passed to this method will be joined to basePath value.
	 * @param {string} path Path to the config entry.
	 * @return {null|string|any} Value from configuration values list. If value is not set then it returns null.
	 */
	get(path) {
		return this.constructor.get(this.basePath + (this.basePath.endsWith(".") ? "" : ".") + path);
	}

	/**
	 * Extend current {@link ConfigManager} instance with additional basePath value.
	 * @param {string} path Appended path value for new ConfigManager instance.
	 * @return {ConfigManager}
	 */
	extend(path) {
		return new this.constructor(this.basePath + (this.basePath.endsWith(".") ? "" : ".") + path);
	}
}

module.exports = ConfigManager;
