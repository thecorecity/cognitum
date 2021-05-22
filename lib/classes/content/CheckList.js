const { log } = require("../Utils");

/**
 * # Check list
 * This is array for generating check lists. Actual list will be generated on `toString` method calling.
 * @example
 * const checkList = new CheckList();
 *
 * // Customizing checked/unchecked state emoji/text.
 * checkList.checkedEmoji = "[v]";
 * checkList.uncheckedEmoji = "[_]";
 *
 * // Checked element
 * checkList.push({ state: true, text: "Some enabled field!" });
 *
 * // Unchecked element
 * checkList.push({ state: false, text: "Some disabled field!" });
 *
 * // This element will be skipped with warning in console
 * checkedList.push("Some unsupported value");
 * // CheckList contains incorrect element! This element will be skipped.
 * // "Some unsupported value"
 * // <trace>
 *
 * checkedList.toString();
 * // [v] Some enabled field\n
 * // [_] Some disabled field!
 */
class CheckList extends Array {
	/**
	 * Checked element text or emoji.
	 * @type {string}
	 */
	checkedEmoji = ":white_check_mark:";

	/**
	 * Unchecked element text or emoji.
	 * @type {string}
	 */
	uncheckedEmoji = ":black_large_square:";

	/**
	 * Generating check list from values in array.
	 * @return {string} Generated text.
	 */
	toString() {
		let tempResult = [];
		this.forEach(element => {
			if (
				typeof element !== "object"
				|| element === null
				|| !element.hasOwnProperty("state")
				|| !element.hasOwnProperty("text")
			) {
				log("warn", "CheckList contains incorrect element! This element will be skipped.");
				console.dir(element);
				console.trace();
				return;
			}
			tempResult.push(`${element.state ? this.checkedEmoji : this.uncheckedEmoji} ${element.text}`);
		});
		return tempResult.join("\n");
	}
}

module.exports = CheckList;
