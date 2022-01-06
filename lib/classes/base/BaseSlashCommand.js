const InteractionContext = require("../commands/InteractionContext");

class BaseSlashCommand {
	/**
	 * @type {InteractionContext}
	 * @protected
	 */
	_context;

	/**
	 * @param {InteractionContext} context
	 */
	constructor(context) {
		if (!(context instanceof InteractionContext))
			throw new Error("This command require interaction context to be passed into constructor!");
		this._context = context;
	}

	/**
	 * @abstract
	 */
	async execute() {
		throw new Error("Command execution method is not implemented!");
	}

	/**
	 * Build slash command.
	 * @return {SlashCommandBuilder}
	 * @abstract
	 */
	static build() {
		throw new Error("Command building method is not implemented!");
	}
}

module.exports = BaseSlashCommand;
