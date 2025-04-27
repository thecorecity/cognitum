import _ from "lodash";
import {Model} from "sequelize";
import {createModuleLogger} from "../Utils";

const logger = createModuleLogger("database");

export default class BaseModel extends Model {
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
