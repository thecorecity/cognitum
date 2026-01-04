import winston from "winston";
import { Cognitum } from "../types/types.js";

/**
 * Centralized logging function. Used for unified style of logging.
 * @param type Type of log.
 * @param message Log message to show.
 *
 * @deprecated Deprecated! Use {@link logger} instead.
 */
export function log(type: Cognitum.LogType, message: string) {
	const now = new Date();
	console.log(`${now.toLocaleString()} [${type}] ${message}`);
}

/**
 * Get file name from basename with extension.
 * @param basename Filename with extension.
 * @return Filename without extension. If no extensions available it returns the whole basename.
 * @example
 * let basenameWithExtension = "example.json";
 * let basenameWithoutExtension = "README";
 *
 * Utils.fileName(basenameWithExtension);
 * // "example"
 * Utils.fileName(basenameWithoutExtension);
 * // "README"
 */
export function fileName(basename: string): string {
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
export function fileExtension(basename: string): string | boolean {
	return basename.split(".").pop() ?? false
}

/**
 * Create time string in format `1`d `1`h `1`m `1`s.
 * @param seconds Number of seconds.
 * @return Time string.
 * @example
 * formatTimeString(60);
 * // "1m"
 * formatTimeString(3600);
 * // "1h"
 * formatTimeString(100500);
 * // "1d 3h 55m"
 */
export function formatTimeString(seconds: number): string {
	seconds = Math.floor(seconds);
	let minutes = Math.floor(seconds / 60);
	let hours = Math.floor(minutes / 60);
	let days = Math.floor(hours / 24);
	let result: string[] = [];

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
 * @param value Original string.
 * @return Escaped string. If after escaping this string will empty then it returns empty string.
 */
export function escapeMarkdown(value: string): string {
	let escaped = value.replace(/`/g, "");
	if (escaped.length === 0)
		return "";
	return `\`${escaped}\``;
}

/**
 * Automatically decide how to format the provided username. Discord decided to switch from username#discriminator to
 * the plain username format, so we need to keep the original format when user is not changed it username yet and show
 * a new one in case if he is changed it.
 * @param tagOrUsername Original username.
 * @return Tag#Descriminator for old username format and @username for a new one.
 */
export function resolveUserName(tagOrUsername: string): string {
	if (tagOrUsername.endsWith("#0")) {
		return "@" + tagOrUsername.replace(/#0$/, "");
	}

	return tagOrUsername;
}

/**
 * Format amount of bytes to the human-readable string.
 * @param bytes Amount of bytes.
 * @param [decimals = 2] Amount of decimals after point.
 */
export function formatDataSize(bytes: number, decimals: number = 2): string {
	if (bytes < 1024)
		return `${bytes} B`;
	let unit = -1;
	const roundBy = 10 ** decimals;
	do {
		bytes /= 1024;
		unit++;
	} while (Math.round(Math.abs(bytes) * roundBy) / roundBy >= 1024 && unit < fileSizeUnits.length - 1);
	return `${bytes.toFixed(decimals)} ${fileSizeUnits[unit]}`;
}

/**
 * List of filesize units used for generating human readable filesize strings.
 */
const fileSizeUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

/**
 * Winston logger object.
 */
export const logger: winston.Logger = createWinstonLogger();

/**
 * Create logger for module.
 * @param moduleName
 */
export function createModuleLogger(moduleName: string): winston.Logger {
	return createWinstonLogger(moduleName);
}

/**
 * Check key safety for using as object key.
 * @param key Target key.
 * @return Is this key safe for use as object's key.
 */
export function checkObjectKeySafety(key: string): boolean {
	return !unsafeKeys.includes(key);
}

/**
 * Winston logger factory.
 * @param [label] Label if required
 */
function createWinstonLogger(label: string = "main"): winston.Logger {
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

/**
 * Convert provided value into the bigint or use the default value on failure.
 * @param value Any value for parsing into bigint.
 * @param defaultValue Default value in case value is not unable to parse.
 * @return Result value.
 */
export function parseToBigIntOrDefault(value: any, defaultValue: bigint = 0n): bigint {
	try {
		return BigInt(value);
	} catch (e) {
		// Nothing really to do here.
	}

	return defaultValue;
}

const unsafeKeys = ["__proto__", "prototype"];
