import CognitumClient from "./lib/classes/CognitumClient";
import {logger} from "./lib/classes/Utils";
import {GatewayIntentBits} from "discord.js";

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
		GatewayIntentBits.MessageContent,
		// Detecting new ban and unban events
		GatewayIntentBits.GuildModeration,
	]
});

cognitum.initialize().then(() => {
	logger.info("Shard initialization completed!");
}).catch(error => {
	logger.error("Shard initialization failed!");
	console.error(error);
	process.exit();
});
