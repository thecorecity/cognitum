const { Sequelize } = require("sequelize");
const DocumentModel = require("../database/models/DocumentModel");
const GuildModel = require("../database/models/GuildModel");
const GuildChannelModel = require("../database/models/GuildChannelModel");
const GuildMemberModel = require("../database/models/GuildMemberModel");
const MessageStatisticsModel = require("../database/models/MessageStatisticsModel");
const UserModel = require("../database/models/UserModel");
const VoiceStatisticsModel = require("../database/models/VoiceStatisticsModel");
const TaskModel = require("../database/models/TaskModel");
const { createModuleLog } = require("../classes/Utils");
const log = createModuleLog("Database");
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
		this.#initializeModels();
		this.#initializeAssociations();
	}

	/**
	 * Check is connection successful.
	 * @return {Promise<boolean>}
	 */
	static async #isConnectionSuccessful() {
		try {
			await this.sequelizeInstance.authenticate();
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	};

	/**
	 * Initialize all models with before start.
	 */
	static #initializeModels() {
		log("log", "Database models initialization...");
		GuildModel.initialize(this.sequelizeInstance);
		UserModel.initialize(this.sequelizeInstance);
		GuildChannelModel.initialize(this.sequelizeInstance);
		GuildMemberModel.initialize(this.sequelizeInstance);
		DocumentModel.initialize(this.sequelizeInstance);
		MessageStatisticsModel.initialize(this.sequelizeInstance);
		VoiceStatisticsModel.initialize(this.sequelizeInstance);
		TaskModel.initialize(this.sequelizeInstance);
		log("success", "All database models initialized!");
	}

	/**
	 * Initialize required associations between database models.
	 * Must be called after models initialization.
	 */
	static #initializeAssociations() {
		log("log", "Setting up associations...");
		MessageStatisticsModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		MessageStatisticsModel.belongsTo(GuildChannelModel, { foreignKey: "id_channel" });
		VoiceStatisticsModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		DocumentModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		log("success", "Associations set!");
	}

	static #dbInstance = {
		dev() {
			return new Sequelize("cognitum_dev", "cognitum_dev", "cognitum_dev", {
				logging: Config.get("preferences.cognitum.debug"),
				host: "localhost",
				dialect: "mariadb",
				dialectOptions: {
					timezone: process.env.TZ
				}
			});
		},

		mariadb() {
			let db = Config.get("db.mariadb");
			let pool = Config.get("db.pool");
			return new Sequelize(db.database, db.username, db.password, {
				logging: Config.get("preferences.cognitum.debug"),
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
	DocumentModel,
	GuildModel,
	GuildChannelModel,
	GuildMemberModel,
	MessageStatisticsModel,
	TaskModel,
	UserModel,
	VoiceStatisticsModel
};
