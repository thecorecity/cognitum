import BaseModel from "../../classes/base/BaseModel";
import {CreationOptional} from "sequelize";

export default class UserModel extends BaseModel<UserModel> {
	declare id: string;
	declare access: CreationOptional<number>;
	declare trackable: CreationOptional<number>;
}
