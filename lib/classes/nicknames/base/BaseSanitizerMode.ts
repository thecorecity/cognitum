export default abstract class BaseSanitizerMode {
	readonly #value: string;

	/**
	 * @param value Value for validation and sanitizing.
	 */
	constructor(value: string) {
		this.#value = value;
	}

	/**
	 * Current value getter.
	 * @return {string}
	 */
	get value(): string {
		return this.#value;
	}

	/**
	 * Placeholder for the fully invalid nicknames.
	 */
	get placeholder(): string {
		return (this.constructor as typeof BaseSanitizerMode).placeholder;
	}

	abstract validate(): boolean;

	abstract sanitize(): string;

	static code: string = "base";
	static placeholder: string = "";

	static getCode() {
		return this.code;
	}
}
