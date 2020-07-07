const { log } = require("../Utils");

class BulletedList extends Array {
	/**
	 * Array of allowed marker types.
	 * @type {string[]}
	 */
	static #allowedMarkerTypes = ["string", "number"];

	/**
	 * List marker.
	 * @type {string}
	 */
	#marker = "+";

	/**
	 * @param {string|number|null} value New marker value.
	 */
	set marker(value) {
		// Setting up default value on null passed.
		if (value === null)
			value = "+";
		if (this.constructor.#allowedMarkerTypes.includes(typeof value)) {
			value = value.toString();
			// If empty string passed then reset marker to default.
			if (value.length < 1)
				value = "+";
			this.#marker = value;
		} else {
			log("warn", `Trying to pass wrong marker type on !${this.name}`);
			console.trace("Warning: Incorrect marker type passed at:");
		}
	}

	get marker() {
		return this.#marker;
	}

	/**
	 * Generate text from this array.
	 * @return {string} Generated content.
	 */
	toString() {
		let tempResult = [];
		this.forEach(value => {
			tempResult.push(
				this.#marker + " " + value
			);
		});
		return tempResult.join("\n");
	}
}

module.exports = BulletedList;
