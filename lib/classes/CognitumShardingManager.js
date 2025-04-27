import ConfigManager from "./ConfigManager";
import {ShardingManager} from "discord.js";
import {createModuleLogger} from "./Utils";

const logger = createModuleLogger("shardManager");

export default class CognitumShardingManager extends ShardingManager {
	static async initialize() {
		await ConfigManager.initialize();

		return new CognitumShardingManager("./shard.js", { token: ConfigManager.get("auth.discord.token") });
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
