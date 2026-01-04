import _ from "lodash";
import { InferAttributes, InferCreationAttributes, InitOptions, Model, ModelAttributes, Sequelize } from "sequelize";
import { createModuleLogger } from "../Utils";

const logger = createModuleLogger("database");

export default abstract class BaseModel<TSelf extends Model> extends Model<InferAttributes<TSelf>, InferCreationAttributes<TSelf>> {
	/**
	 * @inheritDoc
	 * @abstract
	 */
	protected static attributes: ModelAttributes;
	/**
	 * @inheritDoc
	 * @abstract
	 */
	static initOptions: InitOptions;

	static initialize(sequelize: Sequelize): void {
		// FIXME Rework initialization of models to make it more TypeScript-friendly.
		(this as any).init(this.attributes, _.merge(this.initOptions, { sequelize }));
		logger.debug(`Database model loaded: ${this.initOptions.tableName}.`);
	}
}
