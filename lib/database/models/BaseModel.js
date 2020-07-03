const _ = require("lodash");
const { Model } = require("sequelize");
const { log } = require("../../classes/Utils.js");

class BaseModel extends Model {
	static attributes;
	static options;

	static initialize(sequelize) {
		this.init(this.attributes, _.merge(this.options, { sequelize }));
		log("log", `Database model loaded: ${this.name}.`);
	}
}

module.exports = BaseModel;
