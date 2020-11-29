const CognitumClient = require("./lib/classes/CognitumClient");
const { log } = require("./lib/classes/Utils");
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
	log("success", "Initialization success!");
}).catch(error => {
	log("error", "Initialization failed! Error:");
	console.error(error);
	process.exit();
});
