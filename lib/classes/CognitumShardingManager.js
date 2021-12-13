const ConfigManager = require("./ConfigManager");
const { ShardingManager } = require("discord.js");
const logger = require("./Utils").createModuleLogger("shardManager");

class CognitumShardingManager extends ShardingManager {
	static async initialize() {
		await ConfigManager.initialize();
		new CognitumShardingManager("./shard.js", { token: ConfigManager.get("auth.discord.token") });
	}

	constructor(file, options) {
		super(file, options);
		this.#attachEventListeners();
		this.spawn().then(() => {
			logger.info("Shards spawning completed!");
		}).catch((error) => {
			logger.warn("Shard spawning failed!");
			console.error(error);
		});
	}

	#attachEventListeners() {
		this.on("shardCreate", shard => void logger.info(`Shard spawned: ${shard.id}`));
	}
}

module.exports = CognitumShardingManager;
