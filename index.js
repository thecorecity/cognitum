const Bot = require("./lib/classes/Bot.js");
const { log } = require("./lib/classes/Utils.js");

const cognitum = new Bot();
cognitum.initialize().then(() => {
	log("success", "Initialization success!");
}).catch(error => {
	log("error", "Initialization failed! Error:");
	console.error(error);
	process.exit();
});
