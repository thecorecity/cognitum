import CognitumShardingManager from "./lib/classes/CognitumShardingManager";
import {logger} from "./lib/classes/Utils";

CognitumShardingManager
	.initialize()
	.then(() => {
		logger.info("Sharding manager initialized");
	})
	.catch((error) => {
		logger.info("Sharding manager failed!");
		logger.error(error);
		process.exit();
	});
