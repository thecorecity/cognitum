import BaseCategory from "../classes/base/commands/BaseCategory";

export default class HiddenCategory extends BaseCategory {
	static code = "hidden";
	static visible = false;
}
