const { escapeMarkdown } = require("../Utils.js");

class OrderedList extends Array {
	/**
	 * Starting point of ordered list.
	 * @type {number}
	 */
	#startPoint = 1;

	/**
	 * Styler function for current list.
	 */
	#styler;

	get startPoint() {
		return this.#startPoint;
	}

	/**
	 * @param {number} value Starting point.
	 */
	set startPoint(value) {
		if (typeof value === "number" && isFinite(value) && value > 0)
			this.#startPoint = value;
		else {
			console.trace(`Warning: Incorrect starting point passed to ${this.name} object at:`);
		}
	}

	/**
	 * Set callable function for
	 * @param {function(string): string|null} callable Function for styling ordered list number. If null passed, it
	 *     will remove current attached styler function.
	 */
	setStyler(callable) {
		if (callable === null || typeof callable === "function")
			this.#styler = callable;
		this.#styler = callable;
	}

	/**
	 * Generate text from this array.
	 * @return {string}
	 */
	toString() {
		let tempResult = [];
		this.forEach((value, index) => {
			tempResult.push(
				escapeMarkdown(
					this.#formatNumber(
						(index + this.#startPoint).toString()
					)
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
	#formatNumber(original) {
		if (typeof this.#styler !== "function")
			return original;
		return this.#styler(original) ?? original;
	}
}

module.exports = OrderedList;
