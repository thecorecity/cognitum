const CognitumClient = require("./lib/classes/CognitumClient.js");
const { log } = require("./lib/classes/Utils.js");

const cognitum = new CognitumClient();
cognitum.initialize().then(() => {
	log("success", "Initialization success!");
}).catch(error => {
	log("error", "Initialization failed! Error:");
	console.error(error);
	process.exit();
});
