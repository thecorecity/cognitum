const { log } = require("./Utils");
const path = require("path");
const fs = require("fs").promises;

/**
 * # Configurations manager class
 *
 * Class to access all configuration files
 */
class ConfigManager {

	static #configs = {};

	static async initialize() {
		log("log", "Loading configuration files...");
		const configDir = path.resolve("config");
		const defaultConfigDir = path.resolve("config", ".default");

		const defaultConfigs = await fs.readdir(defaultConfigDir);
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
	}
}

module.exports = ConfigManager;
