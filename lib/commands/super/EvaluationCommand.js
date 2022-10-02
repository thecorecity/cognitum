const BaseCommand = require("../../classes/base/BaseCommand");
const HiddenCategory = require("../../categories/HiddenCategory");
const ConfigManager = require("../../classes/ConfigManager");
const { createModuleLogger } = require("../../classes/Utils");

const logger = createModuleLogger("eval");

class EvaluationCommand extends BaseCommand {
	async run() {
		/**
		 * Do not run evaluation command if user is not authorized superuser.
		 */
		if (!this.#checkAccess()) {
			logger.warn(`${this.context.message.author.tag} Tried to access eval command!`);
			return ":x: You're not a in sudoers list! This accident was reported!";
		}

		return this.constructor.#renderResult(
			this.#evaluateCode()
		);
	}

	/**
	 * Check the access of the command caller to this command.
	 * @return {boolean}
	 */
	#checkAccess() {
		/** @type {array|null} */
		const superUsers = ConfigManager.get("preferences.cognitum.superUsers");

		if (!(superUsers instanceof Array))
			return false;

		return superUsers.includes(this.context.message.author.id);
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
