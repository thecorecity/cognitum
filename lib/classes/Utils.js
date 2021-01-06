const winston = require("winston");

/**
 * # Utilities
 * Object with useful utilities may be used in the code.
 */
class Utils {
	/**
	 * Centralized logging function. Used for unified style of logging.
	 * @param {Cognitum.LogType} type Type of log.
	 * @param {string} message Log message to show.
	 *
	 * @deprecated Deprecated! Use {@link Utils.logger} instead.
	 */
	static log(type, message) {
		const now = new Date();
		console.log(`${now.toLocaleString()} [${type}] ${message}`);
	}

	/**
	 * Logging function factory. Uses closures for inserting module name into the original log function.
	 * @param {string} moduleName Name of the module.
	 * @return {function(type: Cognitum.LogType, message: string): void} A modified log function with module name.
	 *     Similar to {@link Utils.log} function.
	 *
	 * @deprecated Deprecated! Use {@link Utils.createModuleLogger} instead.
	 *
	 * @example
	 * // Creating a modified log function for module.
	 * const log = createModuleLog('SystemModule');
	 *
	 * log('log', 'Loading system module...');
	 * // 8/7/2020, 12:20:36 AM [SystemModule] [log] Loading system module...
	 */
	static createModuleLog(moduleName) {
		return (type, message) => {
			Utils.log(moduleName, `[${type}] ${message}`);
		};
	}

	/**
	 * Get file name from basename with extension.
	 * @param {string} basename Filename with extension.
	 * @return {string} Filename without extension. If no extensions available it returns the whole basename.
	 * @example
	 * let basenameWithExtension = "example.json";
	 * let basenameWithoutExtension = "README";
	 *
	 * Utils.fileName(basenameWithExtension);
	 * // "example"
	 * Utils.fileName(basenameWithoutExtension);
	 * // "README"
	 */
	static fileName(basename) {
		return basename.split(".")
			.slice(0, 1 - +basename.includes(".") * 2)
			.join(".");
	}

	/**
	 * Get file extension from basename.
	 * @param {string} basename Filename with extension.
	 * @return {string|boolean} Extension only. If no extension available then it returns `false`.
	 * @example
	 * let basenameWithExtension = "example.json";
	 * let basenameWithoutExtension = "README";
	 *
	 * Utils.fileExtension(basenameWithExtension);
	 * // "json"
	 * Utils.fileExtension(basenameWithoutExtension);
	 * // false
	 */
	static fileExtension(basename) {
		const fileParts = basename.split(".");
		if (fileParts <= 1)
			return false;
		return fileParts.pop();
	}

	/**
	 * Create time string in format `1`d `1`h `1`m `1`s.
	 * @param {number} seconds Number of seconds.
	 * @return {string} Time string.
	 * @example
	 * formatTimeString(60);
	 * // "1m"
	 * formatTimeString(3600);
	 * // "1h"
	 * formatTimeString(100500);
	 * // "1d 3h 55m"
	 */
	static formatTimeString(seconds) {
		seconds = Math.floor(seconds);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);
		let result = [];

		if (seconds % 60)
			result.unshift(`${seconds % 60}s`);
		if (minutes % 60)
			result.unshift(`${minutes % 60}m`);
		if (hours % 24)
			result.unshift(`${hours % 24}h`);
		if (days)
			result.unshift(`${days}d`);

		return result.join(" ");
	}

	/**
	 * Escape special markdown symbol "`" and wrapping this string into code block (with single quote).
	 * @param {string} value Original string.
	 * @return {string} Escaped string. If after escaping this string will empty then it returns empty string.
	 */
	static escapeMarkdown(value) {
		let escaped = value.replace(/`/g, "");
		if (escaped.length === 0)
			return "";
		return `\`${escaped}\``;
	}

	/**
	 * Format amount of bytes to the human-readable string.
	 * @param {number} bytes Amount of bytes.
	 * @param {number} [decimals = 2] Amount of decimals after point.
	 */
	static formatFileSize(bytes, decimals = 2) {
		if (bytes < 1024)
			return `${bytes} B`;
		let unit = -1;
		const roundBy = 10 ** decimals;
		do {
			bytes /= 1024;
			unit++;
		} while (Math.round(Math.abs(bytes) * roundBy) / roundBy >= 1024 && unit < Utils.#fileSizeUnits.length - 1);
		return `${bytes.toFixed(decimals)} ${Utils.#fileSizeUnits[unit]}`;
	}

	/**
	 * List of filesize units used for generating human readable filesize strings.
	 */
	static #fileSizeUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	/**
	 * Winston logger object.
	 * @type {winston.Logger}
	 */
	static logger = Utils.#createWinstonLogger();

	/**
	 * Create logger for module.
	 * @param {string} [moduleName]
	 * @return {winston.Logger}
	 */
	static createModuleLogger(moduleName) {
		return Utils.#createWinstonLogger(moduleName);
	}

	/**
	 * Winston logger factory.
	 * @param {string} [label] Label if required
	 * @return {winston.Logger}
	 */
	static #createWinstonLogger(label = "main") {
		return winston.createLogger({
			format: winston.format.combine(
				winston.format.label({
					label: label ?? null
				}),
				winston.format.timestamp(),
				winston.format.printf(
					({ level, message, label, timestamp }) => `${timestamp} [${label}] ${level}: ${message}`
				)
			),
			level: "debug",
			transports: [
				new winston.transports.Console()
			]
		});
	}
}

module.exports = Utils;
