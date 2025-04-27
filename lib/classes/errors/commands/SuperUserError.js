import BaseStringableError from "../../base/errors/BaseStringableError";

export default class SuperUserError extends BaseStringableError {
	toString() {
		return ":x: " + this.message;
	}
}
