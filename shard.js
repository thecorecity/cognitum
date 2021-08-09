const CognitumClient = require("./lib/classes/CognitumClient");
const { logger } = require("./lib/classes/Utils");
const { Intents } = require("discord.js");

const cognitum = new CognitumClient({
	disableMentions: "everyone",
	// Explanation for the intents:
	intents: new Intents([
		// Used in remind command for sending notifications after timer ended
		Intents.FLAGS.DIRECT_MESSAGES,
		// Used for statistics calculation, messages execution, determining who is who for building contexts
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES
	])
});
cognitum.initialize().then(() => {
	logger.info("Shard initialization completed!");
}).catch(error => {
	logger.error("Shard initialization failed!");
	console.error(error);
	process.exit();
});
