const { escapeMarkdown } = require("../Utils.js");

class OrderedList extends Array {
	/**
	 * Starting point of ordered list.
	 * @type {number}
	 */
	#startPoint = 1;

	get startPoint() {
		return this.#startPoint;
	}

	/**
	 * @param {number} value Starting point.
	 */
	set startPoint(value) {
		if (typeof value === "number" && isFinite(value))
			this.#startPoint = value;
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
					(index + this.#startPoint).toString()
				) + " " + value
			);
		});
		return tempResult.join("\n");
	}
}

module.exports = OrderedList;
