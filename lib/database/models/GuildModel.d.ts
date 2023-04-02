import BaseModel from "../../classes/base/BaseModel";
import {CreationOptional} from "sequelize";

export default class GuildModel extends BaseModel<GuildModel> {
	declare id: string;
	declare prefix: CreationOptional<string | null>;
	declare access: CreationOptional<number>;
	declare doc_mode: CreationOptional<number>;
	declare nickname_mode: CreationOptional<number>;
	declare nickname_type: CreationOptional<string>;
	declare welcome_mode: CreationOptional<number>;
	declare welcome_channel: CreationOptional<string | null>
	declare welcome_manager_role: CreationOptional<string | null>;
	declare welcome_verified_role: CreationOptional<string | null>;
	declare welcome_message: CreationOptional<string | null>;
	declare logs_enabled: CreationOptional<number>;
	declare logs_private_channel: CreationOptional<string | null>;
	declare logs_public_channel: CreationOptional<string | null>;
	declare logs_join_event: CreationOptional<number>;
	declare logs_left_event: CreationOptional<number>;
	declare logs_rename_event: CreationOptional<number>;
	declare logs_kick_event: CreationOptional<number>;
	declare logs_ban_event: CreationOptional<number>;
	declare logs_msgdelete_event: CreationOptional<number>;
	declare logs_msgimage_event: CreationOptional<number>;
	declare logs_msgupdate_event: CreationOptional<number>;
	declare language: CreationOptional<string>;
	declare cache_timestamp: CreationOptional<Date | string>;
	declare stats_request_mode: CreationOptional<number>;

	static StatsRequestModes: {
		Default: number;
		CacheOnly: number;
	}
}
