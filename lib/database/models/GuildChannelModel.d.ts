import { CreationOptional } from "sequelize";
import BaseModel from "../../classes/base/BaseModel";

export default class GuildChannelModel extends BaseModel<GuildChannelModel> {
	declare id: string;
	declare id_guild: string;
	declare hidden: CreationOptional<number>;
	declare message: CreationOptional<string>;
}
