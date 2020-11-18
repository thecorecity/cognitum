const CognitumShardingManager = require("./lib/classes/CognitumShardingManager");
const { log } = require("./lib/classes/Utils");

CognitumShardingManager.initialize().then(() => {
	log("success", "Initialization successful!");
});
