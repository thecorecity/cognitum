declare type PermissionString = import("discord.js").PermissionString;

declare namespace Database {
	import {
		GuildMemberModel,
		GuildChannelModel,
		UserModel,
		GuildModel,
		DocumentModel,
		MessageStatisticsModel,
		VoiceStatisticsModel,
		TaskModel
	} from "/lib/classes/Database.js";

	public type GuildMemberModel = GuildMemberModel;
	public type GuildChannelModel = GuildChannelModel;
	public type UserModel = UserModel;
	public type GuildModel = GuildModel;
	public type DocumentModel = DocumentModel;
	public type MessageStatisticsModel = MessageStatisticsModel;
	public type VoiceStatisticsModel = VoiceStatisticsModel;
	public type TaskModel = TaskModel;
}

declare namespace Cognitum {
	import Bot from "../classes/Bot.js";

	/**
	 * Available types of log. This types will be used in future for better styling of logging and enabling different
	 * logs channels to show in console prompt.
	 */
	public type LogType = "log" | "error" | "warn" | "info" | "success";

	/**
	 * Argument string lengths mode checking. If "exact" passed, then all values will be checked for equal lengths from
	 * lengths array.
	 */
	public type ArgumentsLengthValidationMode = "max" | "exact";

	public interface ContextModelsInstances {
		guild: Database.GuildModel;
		channel: Database.GuildChannelModel;
		member: Database.GuildMemberModel;
		user: Database.UserModel;
	}

	public interface ContextValidatorOptions {
		callerPermission?: PermissionString | PermissionString[];
		botPermission?: PermissionString | PermissionString[];
		arguments?: Cognitum.CommandArgumentsOptions;
	}

	public type ArgumentErrorType = "min" | "max" | "length" | "value" | "valueList";

	private interface ArgumentLengthOptions {
		mode: Cognitum.ArgumentsLengthValidationMode;
		value: number;
	}

	public interface CommandArgumentsOptions {
		/**
		 * Minimal amount of arguments passed.
		 */
		min?: number;
		/**
		 * Maximal amount of arguments passed.
		 */
		max?: number;
		/**
		 * Array of argument string lengths. If only number passed then it will check lengths depending on lengthsMode
		 * parameter passed. If object with following parameters passed then it will check depending on object's `mode`
		 * parameter passed.
		 */
		lengths?: (number | ArgumentLengthOptions | null)[];
		/**
		 * Global length checking mode. May be overridden by local length mode in lengths array.
		 * @default max
		 */
		lengthsMode?: Cognitum.ArgumentsLengthValidationMode;
		/**
		 * Array of actual values validation. Can contains array of strings or RegExp for arguments testing. If null
		 * provided, then this argument will be skipped from validation.
		 */
		values?: (string[] | RegExp | null)[];
	}

	public interface ContentParsingResult {
		/**
		 * Status of parsing. If command found, it contains `true`. In other situation, it will contain `false`.
		 */
		status: boolean;
		/**
		 * Name of command casted, if it `status` is true.
		 */
		commandName?: string;
		/**
		 * List of arguments passed to this command.
		 */
		args?: string[];
	}

	public interface TimeStringParseResult {
		days: number | null;
		hours: number | null;
		minutes: number | null;
		seconds: number | null;
	}

	public interface TaskQueueRunOptions {
		discordClient: Bot;
	}
}
