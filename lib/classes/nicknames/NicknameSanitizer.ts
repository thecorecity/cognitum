import TransliterateLatinOnlyMode from "./modes/TransliterateLatinOnlyMode";
import LatinAndCyrillicMode from "./modes/LatinAndCyrillicMode";
import type BaseSanitizerMode from "./base/BaseSanitizerMode";

export default class NicknameSanitizer {
	#currentMode: BaseSanitizerMode;

	/**
	 * @param {string} value Value for sanitizing.
	 * @param {string} mode Mode of the sanitizer.
	 */
	constructor(value: string, mode: string = NicknameSanitizer.defaultMode) {
		const SelectedSanitizerMode = NicknameSanitizer.#modes.get(mode);

		if (!SelectedSanitizerMode)
			throw new Error(`Following mode not exist: ${mode}!`);

		this.#currentMode = new SelectedSanitizerMode(value);
	}

	/**
	 * Execute sanitizer and return new nickname value if required.
	 * @return {string}
	 */
	execute(): string {
		if (this.#currentMode.validate())
			return this.#currentMode.value;

		const sanitizedNickname = this.#currentMode.sanitize().trim();

		// In case if sanitizing will fail and return empty string set valid placeholder as nickname
		return sanitizedNickname?.length > 0
			? sanitizedNickname
			: this.#currentMode.placeholder;
	}

	/**
	 * Validate current nickname.
	 * @return {boolean}
	 */
	validate(): boolean {
		return this.#currentMode.validate();
	}

	/**
	 * List of registered modes.
	 */
	static #modes = new Map<string, new (value: string) => BaseSanitizerMode>([
		[TransliterateLatinOnlyMode.getCode(), TransliterateLatinOnlyMode],
		[LatinAndCyrillicMode.getCode(), LatinAndCyrillicMode],
	]);

	/**
	 * Get list of existing modes keys. Can be used to check if this mode exist or for listing all available modes.
	 * @return {string[]}
	 */
	static getModesKeys(): string[] {
		return Array.from(this.#modes.keys());
	}

	/**
	 * Check is following mode exist.
	 * @param {string} mode Mode key.
	 * @return {boolean} Is this mode exist.
	 */
	static isModeExist(mode: string): boolean {
		return this.#modes.has(mode);
	}

	/**
	 * Default sanitizing mode key.
	 * @type {string}
	 */
	static #defaultMode: string = TransliterateLatinOnlyMode.getCode();

	/**
	 * Public getter without ability to override default mode key.
	 * @return {string}
	 */
	static get defaultMode(): string {
		return this.#defaultMode;
	}
}
