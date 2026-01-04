import StringableError from "../base/StringableError";

export default class SuperUserError extends StringableError {
	toString() {
		return ":x: " + this.message;
	}
}
