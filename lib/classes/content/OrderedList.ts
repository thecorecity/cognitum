import {escapeMarkdown} from "../Utils";

type ListStylerFunction = (original: string) => string | number;

export default class OrderedList extends Array {
	/**
	 * Starting point of ordered list.
	 */
	#startPoint: number = 1;

	/**
	 * Styler function for current list.
	 */
	#styler: ListStylerFunction | null = null;

	get startPoint() {
		return this.#startPoint;
	}

	/**
	 * @param value Starting point.
	 */
	set startPoint(value: number) {
		if (isFinite(value) && value > 0)
			this.#startPoint = value;
		else {
			console.trace(`Warning: Incorrect starting point passed to ${this.constructor.name} object at:`);
		}
	}

	/**
	 * Set callable function for styling number in ordered list.
	 * @param callable Function for styling ordered list number. If null passed, it
	 *     will remove current attached styler function.
	 */
	setStyler(callable: ListStylerFunction | null): void {
		if (callable === null || typeof callable === "function")
			this.#styler = callable;
		this.#styler = callable;
	}

	/**
	 * Generate text from this array.
	 */
	toString(): string {
		let tempResult: string[] = [];
		this.forEach((value, index) => {
			tempResult.push(
				escapeMarkdown(
					this.#formatNumber(
						(index + this.#startPoint).toString()
					).toString()
				) + " " + value
			);
		});
		return tempResult.join("\n");
	}

	/**
	 * Format current number.
	 * @param {string} original Original value.
	 * @return {string} Formatted number if styler set.
	 */
	#formatNumber(original: string): string|number {
		if (typeof this.#styler !== "function")
			return original;
		return this.#styler(original) ?? original;
	}

	static STYLER_DOTTED: ListStylerFunction = original => original + ".";
}
