import BaseStringableError from "../base/BaseStringableError";

export default class SuperUserError extends BaseStringableError {
	toString() {
		return ":x: " + this.message;
	}
}
