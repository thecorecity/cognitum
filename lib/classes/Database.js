const {Sequelize} = require("sequelize");
const Guild = require("../database/models/Guild.js");
const GuildChannel = require("../database/models/GuildChannel.js");
const GuildMember = require("../database/models/GuildMember.js");
const User = require("../database/models/User.js");
const fs = require("fs").promises;
const {log} = require("../classes/Utils.js");

class Database {
	/**
	 * Sequelize instance.
	 * @type {Sequelize}
	 */
	static sequelizeInstance;

	static async initialize() {
		log("log", "Initializing database...");
		const configDirectory = await fs.readdir(process.cwd() + "/config");
		if (!configDirectory.includes("auth.json")) {
			log("error", "Initialization failed! Authorization file (/config/auth.json/) not found!");
			process.exit();
		}
		const db = require("../../config/auth.json").mariadb;
		this.sequelizeInstance = new Sequelize(db.database, db.username, db.password, {
			host: db.host,
			dialect: "mariadb"
		});
		try {
			await this.sequelizeInstance.authenticate();
			log("success", "Database authorization successful!");
		} catch (e) {
			log("error", "Database authorization failed! Error:");
			console.error(e);
			process.exit();
		}
		log("log", "Database models initialization...");
		Guild.initialize(this.sequelizeInstance);
		User.initialize(this.sequelizeInstance);
		GuildChannel.initialize(this.sequelizeInstance);
		GuildMember.initialize(this.sequelizeInstance);
		log("success", "All database models initialized!");
	}
}

module.exports = {
	Database,
	Guild,
	GuildChannel,
	GuildMember,
	User
};
