import BaseModel from "../../classes/base/BaseModel";
import {CreationOptional} from "sequelize";

export default class TaskModel extends BaseModel<TaskModel> {
	declare id: CreationOptional<string>;
	declare code: string;
	declare time: Date;
	declare payload: string;
	declare completed: CreationOptional<number>;
}
