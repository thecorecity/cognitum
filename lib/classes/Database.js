const { Sequelize } = require("sequelize");
const Document = require("../database/models/Document.js");
const Guild = require("../database/models/Guild.js");
const GuildChannel = require("../database/models/GuildChannel.js");
const GuildMember = require("../database/models/GuildMember.js");
const User = require("../database/models/User.js");
const VoiceStatistics = require("../database/models/VoiceStatistics.js");

const { log } = require("../classes/Utils.js");
const Config = require("../classes/ConfigManager");

class Database {
	/**
	 * Sequelize instance.
	 * @type {Sequelize}
	 */
	static sequelizeInstance;

	static async initialize() {
		log("log", "Initializing database...");

		let dbtype = Config.get("db.dbtype");
		if (!this.#dbInstance.hasOwnProperty(dbtype)) {
			log("warn", `Database type \`${dbtype}\` is not implemented! \`inmemory\` database used as fallback.`);
			dbtype = "inmemory";
		}

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
		Document.initialize(this.sequelizeInstance);
		VoiceStatistics.initialize(this.sequelizeInstance);
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
	};

	static #dbInstance = {
		inmemory() {
			return new Sequelize("sqlite::memory:");
		},

		mariadb() {
			let db = Config.get("db.mariadb");
			let pool = Config.get("db.pool");
			return new Sequelize(db.database, db.username, db.password, {
				host: db.host,
				dialect: "mariadb",
				dialectOptions: {
					timezone: process.env.TZ
				},
				pool
			});
		}
	};
}

module.exports = {
	Database,
	Document,
	Guild,
	GuildChannel,
	GuildMember,
	User,
	VoiceStatistics
};
