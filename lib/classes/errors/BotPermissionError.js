const CallerPermissionError = require("./CallerPermissionError");

class BotPermissionError extends CallerPermissionError {
	static errorCode = "botPermissionError";
}

module.exports = BotPermissionError;
