/**
 * Base category class.
 * @interface
 */
class BaseCategory {
	/**
     * Category code.
     * @type {string}
     */
	static code;

	/**
     * Category title.
     * @type {string}
     */
	static title;

	/**
     * Get category code.
     * @return {string} Category code.
     */
	static getCode() {
		return this.code;
	}

	/**
     * Get category title. If title is not set, method will return string in next format: `category.%code%.title`.
     * @return {string} Category title or generated string.
     */
	static getTitle() {
		if (typeof this.title !== "string")
			return `category.${this.code}.title`;
		return this.title;
	}
}

module.exports = BaseCategory;
