class BulletedList extends Array {
	/**
	 * List marker.
	 * @type {string}
	 */
	#marker = "+";

	/**
	 * @param {string} value New marker value.
	 */
	set marker(value) {
		if (typeof value === "string" && value.length > 0)
			this.#marker = value;
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
