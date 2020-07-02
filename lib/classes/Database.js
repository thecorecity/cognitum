const { Sequelize } = require("sequelize");
const Guild = require("../database/models/Guild.js");
const GuildChannel = require("../database/models/GuildChannel.js");
const GuildMember = require("../database/models/GuildMember.js");
const User = require("../database/models/User.js");
const { log } = require("../classes/Utils.js");
const DbConfig = require("../../config/db.json");

class Database {
	/**
	 * Sequelize instance.
	 * @type {Sequelize}
	 */
	static sequelizeInstance;

	static async initialize() {
		log("log", "Initializing database...");

		let dbtype = DbConfig.dbtype;
		this.sequelizeInstance = this.#dbInstance[dbtype]();

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

		mariadb() {
			let db = DbConfig.mariadb;
			return new Sequelize(db.database, db.username, db.password, {
				host: db.host,
				dialect: "mariadb"
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
