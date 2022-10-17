const BaseSuperUserCommand = require("../../classes/base/commands/BaseSuperUserCommand");
const HiddenCategory = require("../../categories/HiddenCategory");

class EvaluationCommand extends BaseSuperUserCommand {
	async run() {
		return this.constructor.#renderResult(
			this.#evaluateCode()
		);
	}

	/**
	 * Evaluate the code and return what this code returns.
	 * @return {any}
	 */
	#evaluateCode() {
		return eval(this.args.join(" "));
	}

	/**
	 * Handle result of evaluation and return the result.
	 * @param {any} evaluationResult Any evaluation result which returned from code evaluation.
	 */
	static #renderResult(evaluationResult) {
		if (typeof evaluationResult === "string" || typeof evaluationResult === "number") {
			return `\`\`\`${evaluationResult.toString()}\`\`\``;
		}
		if (typeof evaluationResult === "object" && evaluationResult !== null || evaluationResult instanceof Array) {
			try {
				return `\`\`\`json\n${JSON.stringify(evaluationResult)}\n\`\`\``;
			} catch (e) {
				return "```Object or array can't be encoded to JSON!```";
			}
		}
		return evaluationResult;
	}

	static category = HiddenCategory.getCode();
	static code = "eval";
}

module.exports = EvaluationCommand;
