const { Sequelize } = require("sequelize");
const Guild = require("../database/models/Guild.js");
const GuildChannel = require("../database/models/GuildChannel.js");
const GuildMember = require("../database/models/GuildMember.js");
const User = require("../database/models/User.js");
const fs = require("fs").promises;
const { log } = require("../classes/Utils.js");

class Database {
	/**
	 * Sequelize instance.
	 * @type {Sequelize}
	 */
	static sequelizeInstance;

	static async initialize() {
		log("log", "Initializing database...");

		const configDirectory = await fs.readdir(process.cwd() + "/config");
		if (!configDirectory.includes("db.json")) {
			log("warn", "Can not load database configuration file. Using sqlite in-memory database as fallback option.");
			this.sequelizeInstance = this.#dbInstance.inmemory();
		} else {
			let dbConfig = require("../../config/db.json");
			let dbtype = dbConfig.dbtype;

			this.sequelizeInstance = this.#dbInstance[dbtype](dbConfig);
		}

		if (await this.#isConnectionSuccessful()) {
			log("success", "Database authorization successful!");
		} else {
			log("error", "Database authorization failed!");
			process.exit();
		}

		log("log", "Database models initialization...");
		Guild.initialize(this.sequelizeInstance);
		User.initialize(this.sequelizeInstance);
		GuildChannel.initialize(this.sequelizeInstance);
		GuildMember.initialize(this.sequelizeInstance);
		log("success", "All database models initialized!");
	}

	static #isConnectionSuccessful = async () => {
		try {
			await this.sequelizeInstance.authenticate();
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	static #dbInstance = {
		inmemory() {
			return new Sequelize("sqlite::memory:");
		},

		mariadb(dbConfig) {
			let db = dbConfig.mariadb;
			let pool = dbConfig.pool;
			return new Sequelize(db.database, db.username, db.password, {
				host: db.host,
				dialect: "mariadb",
				dialectOptions: {
					timezone: process.env.TZ
				},
				pool
			});
		}
	}
}

module.exports = {
	Database,
	Guild,
	GuildChannel,
	GuildMember,
	User
};
