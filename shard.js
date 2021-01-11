const CognitumClient = require("./lib/classes/CognitumClient");
const { logger } = require("./lib/classes/Utils");
const { Intents } = require("discord.js");

const cognitum = new CognitumClient({
	disableMentions: "everyone",
	ws: {
		// TODO Specify all intents required for bot functionality
		intents: new Intents([
			Intents.NON_PRIVILEGED,
			Intents.FLAGS.GUILD_MEMBERS
		])
	}
});
cognitum.initialize().then(() => {
	logger.info("Shard initialization completed!");
}).catch(error => {
	logger.error("Shard initialization failed!");
	console.error(error);
	process.exit();
});
