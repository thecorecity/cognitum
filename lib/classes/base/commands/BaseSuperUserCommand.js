const BaseCommand = require("./BaseCommand");
const ConfigManager = require("../../ConfigManager");
const SuperUserError = require("../../errors/commands/SuperUserError");

/**
 * @abstract
 */
class BaseSuperUserCommand extends BaseCommand {
	/**
	 * Check if current user is a superuser.
	 * @return {boolean}
	 * @protected
	 */
	#isSuperUser() {
		/** @type {array|null} */
		const superUsers = ConfigManager.get("preferences.cognitum.superUsers");

		if (!(superUsers instanceof Array))
			return false;

		return superUsers.includes(this.context.message.author.id.toString());
	}

	/**
	 * Validation of the superuser command additionally calls for superuser check. If user is not mentioned in the
	 * configuration file, the command will not be executed and special error will be shown.
	 * @return {Promise<void>}
	 */
	async validate() {
		if (!this.#isSuperUser()) {
			console.trace(`${this.context.message.author.tag} tried to access sudo command!`);
			throw new SuperUserError("You're not a superuser! This incident will be reported!");
		}

		await super.validate();
	}
}

module.exports = BaseSuperUserCommand;
