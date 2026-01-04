import EmbeddableError from "./base/EmbeddableError";
import type CommandContext from "../commands/CommandContext";

interface ArgumentErrorsMap {
	min: {
		minValue: number,
	},
	max: {
		maxValue: number,
	},
	length: {
		argumentIndex: number,
		requiredLength: number
	},
	valueList: {
		argumentExpectedList: string,
		argumentPassed: string,
	},
	value: {
		argumentPassed: string,
	},
}

export type ArgumentErrorType = keyof ArgumentErrorsMap;

export default class ArgumentError<ErrorType extends ArgumentErrorType> extends EmbeddableError {
	static errorCode: string = "invalidArgumentError";

	readonly #langOptions: ArgumentErrorsMap[ErrorType];

	/**
	 * @param errorType Error subtype.
	 * @param langOptions Options for passing on lang calling.
	 */
	constructor(errorType: ErrorType, langOptions: ArgumentErrorsMap[ErrorType]) {
		super(errorType);

		this.#langOptions = langOptions;
	}

	protected generateEmbedOptions(context: CommandContext): Record<string, string> {
		return {
			details: context.lang.get(
				`embed.errors.${(this.constructor as typeof EmbeddableError).errorCode}.${this.message}`,
				this.#langOptions
			)
		};
	}
}
