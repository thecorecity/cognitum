const ConfigManager = require("./ConfigManager");
const { ShardingManager } = require("discord.js");
const log = require("./Utils").createModuleLog("ShardingManager");

class CognitumShardingManager extends ShardingManager {
	static async initialize() {
		await ConfigManager.initialize();
		new CognitumShardingManager("./shard.js", { token: ConfigManager.get("auth.discord.token") });
	}

	constructor(file, options) {
		super(file, options);
		this.attachEventListeners();
		this.spawn().then(() => {
			log("success", "Manager successfully spawned!");
		}).catch((error) => {
			log("error", "Manager spawning failed!");
			console.error(error);
			process.exit();
		});
	}

	attachEventListeners() {
		this.on("shardCreate", shard => log("success", `Shard spawned: ${shard.id}`));
	}
}

module.exports = CognitumShardingManager;
