const _ = require("lodash");
const { Model } = require("sequelize");
const { createModuleLogger } = require("../Utils.js");
const logger = createModuleLogger("database");

class BaseModel extends Model {
	static attributes;
	static options;

	static initialize(sequelize) {
		this.init(this.attributes, _.merge(this.options, { sequelize }));
		logger.debug(`Database model loaded: ${this.name}.`);
	}
}

module.exports = BaseModel;
