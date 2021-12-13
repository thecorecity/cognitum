import {
	AwaitMessageComponentOptions,
	AwaitMessagesOptions,
	InteractionCollector,
	InteractionCollectorOptions,
	Message,
	MessageCollector,
	MessageCollectorOptions,
	MessageComponentInteraction,
	MessageOptions,
	MessagePayload,
	MessageResolvable
} from "discord.js";
import {Snowflake} from "discord-api-types";
import {Collection} from "@discordjs/collection";

declare type PermissionString = import("discord.js").PermissionString;

/**
 * Fix IDEA not fetching `send` method correctly for channels and members. Not sure if it's issue with a IDE, library
 * itself or just a TypeScript language service, but for better methods resolving this is important.
 */
declare module "discord.js" {
	class TextBasedChannels {
		send(options: string | MessagePayload | MessageOptions): Promise<Message>;

		lastMessageId: Snowflake | null;
		readonly lastMessage: Message | null;
		lastPinTimestamp: number | null;
		readonly lastPinAt: Date | null;

		awaitMessageComponent<T extends MessageComponentInteraction = MessageComponentInteraction>(
			options?: AwaitMessageComponentOptions<T>,
		): Promise<T>;

		awaitMessages(options?: AwaitMessagesOptions): Promise<Collection<Snowflake, Message>>;

		bulkDelete(
			messages: Collection<Snowflake, Message> | readonly MessageResolvable[] | number,
			filterOld?: boolean,
		): Promise<Collection<Snowflake, Message>>;

		createMessageComponentCollector<T extends MessageComponentInteraction = MessageComponentInteraction>(
			options?: InteractionCollectorOptions<T>,
		): InteractionCollector<T>;

		createMessageCollector(options?: MessageCollectorOptions): MessageCollector;

		sendTyping(): Promise<void>;
	}
}

declare namespace Cognitum {
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
