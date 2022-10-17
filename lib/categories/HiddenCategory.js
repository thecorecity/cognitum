const BaseCategory = require("../classes/base/commands/BaseCategory");

class HiddenCategory extends BaseCategory {
	static code = "hidden";
	static visible = false;
}

module.exports = HiddenCategory;
