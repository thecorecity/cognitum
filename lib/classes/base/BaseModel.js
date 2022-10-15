const _ = require("lodash");
const { Model } = require("sequelize");
const { createModuleLogger } = require("../Utils");
const logger = createModuleLogger("database");

class BaseModel extends Model {
	/**
	 * @inheritDoc
	 * @abstract
	 */
	static attributes;
	/**
	 * @inheritDoc
	 * @abstract
	 */
	static initOptions;

	static initialize(sequelize) {
		this.init(this.attributes, _.merge(this.initOptions, { sequelize }));
		logger.debug(`Database model loaded: ${this.name}.`);
	}
}

module.exports = BaseModel;
