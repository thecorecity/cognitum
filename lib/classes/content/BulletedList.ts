export default class BulletedList extends Array {
	/**
	 * Array of allowed marker types.
	 */
	static #allowedMarkerTypes: string[] = ["string", "number"];

	/**
	 * List marker.
	 * @type {string}
	 */
	#marker: string = "+";

	/**
	 * @param value New marker value.
	 */
	set marker(value: string | number | null) {
		// Setting up default value on null passed.
		if (value === null)
			value = "+";
		if (BulletedList.#allowedMarkerTypes.includes(typeof value)) {
			value = value.toString();
			// If empty string passed then reset marker to default.
			if (value.length < 1)
				value = "+";
			this.#marker = value;
		} else {
			console.trace(`Warning: Incorrect marker type passed to ${this.constructor.name} object at:`);
		}
	}

	get marker() {
		return this.#marker;
	}

	/**
	 * Generate text from this array.
	 * @return Generated content.
	 */
	toString(): string {
		let tempResult: string[] = [];
		this.forEach(value => {
			tempResult.push(
				this.#marker + " " + value
			);
		});
		return tempResult.join("\n");
	}
}
