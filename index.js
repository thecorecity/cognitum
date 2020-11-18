const { ShardingManager } = require("discord.js");
const ConfigManager = require("./lib/classes/ConfigManager");

ConfigManager.initialize().then(() => {
	const shardingManager = new ShardingManager("./shard.js", { token: ConfigManager.get("auth.discord.token") });
	shardingManager.on("shardCreate", shard => console.log(`Loaded shard #${shard.id}!`));
	return shardingManager.spawn();
}).then(() => {
	console.log("Spawning successful!");
}).catch((error) => {
	console.error("Failed to initialize ShardingManager!");
	console.error(error);
	process.exit();
});
