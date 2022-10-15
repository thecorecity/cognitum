import BaseModel from "../../classes/base/BaseModel";
import {CreationOptional} from "sequelize";
import GuildMemberModel from "./GuildMemberModel";
import GuildChannelModel from "./GuildChannelModel";

export default class MessageStatisticsModel extends BaseModel<MessageStatisticsModel> {
	declare id: CreationOptional<string>;
	declare id_member: number;
	declare id_channel: string;
	declare timestamp: CreationOptional<Date | string>;
	declare weight: number;

	readonly GuildMemberModel: GuildMemberModel;
	readonly GuildChannelModel: GuildChannelModel;
}
