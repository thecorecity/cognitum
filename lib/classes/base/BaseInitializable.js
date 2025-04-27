/**
 * Base class for classes that can be initialized.
 * @abstract
 */
export default class BaseInitializable {
	/**
	 * Initialization method. Must return instance of class.
	 * @return {Promise<BaseInitializable>}
	 */
	async initialize() {
		return this;
	}
}
