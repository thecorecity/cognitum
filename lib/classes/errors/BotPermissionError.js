const CallerPermissionError = require("./CallerPermissionError.js");

class BotPermissionError extends CallerPermissionError {
	static errorCode = "botPermissionError";
}

module.exports = BotPermissionError;
