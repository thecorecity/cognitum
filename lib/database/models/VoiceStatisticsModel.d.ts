import BaseModel from "../../classes/base/BaseModel";
import {CreationOptional} from "sequelize";
import GuildMemberModel from "./GuildMemberModel";

export default class VoiceStatisticsModel extends BaseModel<VoiceStatisticsModel> {
	declare id: CreationOptional<number>;
	declare id_member: number;
	declare timestamp_begin: Date | string;
	declare weight: string;
	declare cached: number;

	readonly GuildMemberModel: GuildMemberModel;
}
