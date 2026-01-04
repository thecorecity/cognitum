import StringableError from "../base/StringableError";

export default class SuperUserError extends StringableError {
	toString(): string {
		return ":x: " + this.message;
	}
}
