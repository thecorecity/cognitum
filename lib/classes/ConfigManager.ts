import { checkObjectKeySafety, createModuleLogger, fileName } from "./Utils";
import path from "path";
import { promises as fs } from "fs";
import _ from "lodash";
import ignore from "ignore";

const logger = createModuleLogger("config");

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
export default class ConfigManager {
	/**
	 * Configuration files loaded from `/config/` directory.
	 * @type {Record<string, Object>}
	 */
	static #configs: Record<string, any> = {};

	/**
	 * Initialization method. Its loading configuration files from `/config/default/` directory
	 * and checks, if files with same name exists in `/config/` direcotry.
	 * If some files is not exists in `/config/`, then the default ones are copied.
	 */
	static async initialize(): Promise<void> {
		logger.info("Loading configuration files...");

		const directory = path.resolve("config");
		const defaultDirectory = path.resolve("config", ".default");

		let defaultFiles = await fs.readdir(defaultDirectory);
		let configurationFiles = await fs.readdir(directory);

		// Files copying may be restricted by the file system
		try {
			for (const fileName of defaultFiles) {
				// Skip if configuration file is already defined
				if (configurationFiles.includes(fileName)) {
					continue;
				}

				logger.warn(`${fileName} not found in "/config". Default ${fileName} created.`);

				await fs.copyFile(
					path.resolve(defaultDirectory, fileName),
					path.resolve(directory, fileName)
				);
			}
		} catch (e) {
			logger.error("Failed to copy default configs! Manual configuration required!");
			process.exit();
		}

		const configIgnore = ignore().add(
			(await fs.readFile(
				path.resolve("config", ".confignore")
			)).toString()
		);

		configurationFiles = await fs.readdir(directory);
		configurationFiles = configIgnore.filter(configurationFiles);

		for (const configFullName of configurationFiles) {
			const configKey = fileName(configFullName);
			if (!checkObjectKeySafety(configKey)) {
				logger.warn(`Invalid file name for config: ${configKey}! Config file skipped!`);
				continue;
			}

			const configurationJson = await fs.readFile(
				path.resolve(directory, configFullName)
			);

			this.#configs[configKey] = JSON.parse(configurationJson.toString());
		}

		logger.info("All configuration files loaded.");
	}

	/**
	 * Get configuration value by path. It uses lodash `at` methods to resolve path.
	 * @param path Path to config entry.
	 * @return Value from configuration values list. If value is not set then it returns null.
	 */
	static get(path: string): any {
		return _.at(this.#configs, [path])[0] ?? null;
	}

	/**
	 * Base path for resolving values using {@link ConfigManager} instance.
	 */
	readonly #basePath: string = "";

	/**
	 * @param path Base path for configuration value.
	 */
	constructor(path: string) {
		this.#basePath = path;
	}

	/**
	 * Base path of current {@link ConfigManager} instance.
	 */
	get basePath(): string {
		return this.#basePath;
	}

	/**
	 * Get configuration value by path. Path passed to this method will be joined to basePath value.
	 * @param {string} path Path to the config entry.
	 * @return {null|string|any} Value from configuration values list. If value is not set then it returns null.
	 */
	get(path: string): any {
		return ConfigManager.get(
			this.basePath + (this.basePath.endsWith(".") ? "" : ".") + path
		);
	}

	/**
	 * Extend current {@link ConfigManager} instance with additional basePath value.
	 * @param {string} path Appended path value for new {@link ConfigManager} instance.
	 * @return {ConfigManager} Extendet instance of the {@link ConfigManager}
	 */
	extend(path: string): ConfigManager {
		return new ConfigManager(this.basePath + (this.basePath.endsWith(".") ? "" : ".") + path);
	}
}
