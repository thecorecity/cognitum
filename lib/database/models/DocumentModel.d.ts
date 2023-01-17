import {CreationOptional, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import BaseModel from "../../classes/base/BaseModel";
import GuildMemberModel from "./GuildMemberModel";

export default class DocumentModel extends BaseModel<DocumentModel> {
	declare id: CreationOptional<number>;
	declare id_member: number;
	declare name: string;
	declare title: CreationOptional<string>;
	declare content: string;
	declare image_url: CreationOptional<string>;
	declare hidden: CreationOptional<number>;

	readonly GuildMemberModel: GuildMemberModel;
}
