import BaseModel from "../../classes/base/BaseModel";
import {CreationOptional} from "sequelize";

export default class GuildMemberModel extends BaseModel<GuildMemberModel> {
	declare id: CreationOptional<number>;
	declare id_guild: string;
	declare id_user: string;
	declare access: CreationOptional<number>;
}
