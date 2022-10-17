const BaseStringableError = require("../../base/errors/BaseStringableError");

class SuperUserError extends BaseStringableError {
	toString() {
		return ":X: " + this.message;
	}
}

module.exports = SuperUserError;
