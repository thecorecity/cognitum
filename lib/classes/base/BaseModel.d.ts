import {InferAttributes, InferCreationAttributes, InitOptions, Model, ModelAttributes, Sequelize} from "sequelize";

export default abstract class BaseModel<TSelf extends Model> extends Model<InferAttributes<TSelf>, InferCreationAttributes<TSelf>> {
	static initialize(sequelize: Sequelize);

	protected abstract static attributes: ModelAttributes<TSelf>;
	protected abstract static initOptions: InitOptions;
}
