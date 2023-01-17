const BaseStringableError = require("../../base/errors/BaseStringableError");

class SuperUserError extends BaseStringableError {
	toString() {
		return ":x: " + this.message;
	}
}

module.exports = SuperUserError;
