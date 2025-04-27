import CallerPermissionError from "./CallerPermissionError";

export default class BotPermissionError extends CallerPermissionError {
	static errorCode = "botPermissionError";
}
