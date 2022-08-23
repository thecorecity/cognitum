const CognitumClient = require("./lib/classes/CognitumClient");
const { logger } = require("./lib/classes/Utils");
const { GatewayIntentBits } = require("discord.js");

const cognitum = new CognitumClient({
	// Explanation for the intents:
	intents: [
		// Used in remind command for sending notifications after timer ended
		GatewayIntentBits.DirectMessages,
		// Used for statistics calculation, messages execution, determining who is who for building contexts
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		// Detecting new ban and unban events
		GatewayIntentBits.GuildBans,
	]
});

cognitum.initialize().then(() => {
	logger.info("Shard initialization completed!");
}).catch(error => {
	logger.error("Shard initialization failed!");
	console.error(error);
	process.exit();
});
