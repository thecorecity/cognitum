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
	 * Flag for category.
	 * @type {boolean}
	 */
	static visible = true;

	/**
	 * Get category code.
	 * @return {string} Category code.
	 */
	static getCode() {
		return this.code;
	}

	/**
	 * Get category title.
	 * @return {string} Title code for {@link Lang} class in format: `category.%code%.title`.
	 */
	static getTitle() {
		return `category.${this.code}.title`;
	}

	/**
	 * Get visibility flag.
	 * @return {boolean} Is this category must be visible in `help` command.
	 */
	static getVisible() {
		return this.visible;
	}
}

module.exports = BaseCategory;
