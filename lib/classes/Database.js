const { Sequelize } = require("sequelize");
const DocumentModel = require("../database/models/DocumentModel");
const GuildModel = require("../database/models/GuildModel");
const GuildChannelModel = require("../database/models/GuildChannelModel");
const GuildMemberModel = require("../database/models/GuildMemberModel");
const MessageStatisticsModel = require("../database/models/MessageStatisticsModel");
const UserModel = require("../database/models/UserModel");
const VoiceStatisticsModel = require("../database/models/VoiceStatisticsModel");
const TaskModel = require("../database/models/TaskModel");
const { createModuleLogger } = require("../classes/Utils");
const logger = createModuleLogger("database");
const ConfigManager = require("../classes/ConfigManager");

const databaseConfig = new ConfigManager("db");
const cognitumSettings = new ConfigManager("preferences.cognitum");

class Database {
	/**
	 * Sequelize instance.
	 * @type {Sequelize}
	 */
	static #sequelizeInstance;

	static async initialize() {
		logger.info("Initializing database...");

		let dbtype = databaseConfig.get("dbtype");
		if (!this.#dbInstance.hasOwnProperty(dbtype)) {
			logger.warn(`Database type \`${dbtype}\` is not implemented! \`inmemory\` database used as fallback.`);
			dbtype = "inmemory";
		}

		this.#sequelizeInstance = this.#dbInstance[dbtype]();

		if (await this.#isConnectionSuccessful()) {
			logger.info("Database authorization successful!");
		} else {
			logger.error("Database authorization failed!");
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
			await this.#sequelizeInstance.authenticate();
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
		logger.info("Database models initialization...");
		GuildModel.initialize(this.#sequelizeInstance);
		UserModel.initialize(this.#sequelizeInstance);
		GuildChannelModel.initialize(this.#sequelizeInstance);
		GuildMemberModel.initialize(this.#sequelizeInstance);
		DocumentModel.initialize(this.#sequelizeInstance);
		MessageStatisticsModel.initialize(this.#sequelizeInstance);
		VoiceStatisticsModel.initialize(this.#sequelizeInstance);
		TaskModel.initialize(this.#sequelizeInstance);
		logger.info("All database models initialized!");
	}

	/**
	 * Initialize required associations between database models.
	 * Must be called after models initialization.
	 */
	static #initializeAssociations() {
		logger.info("Setting up associations...");
		MessageStatisticsModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		MessageStatisticsModel.belongsTo(GuildChannelModel, { foreignKey: "id_channel" });
		VoiceStatisticsModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		DocumentModel.belongsTo(GuildMemberModel, { foreignKey: "id_member" });
		logger.info("Associations set!");
	}

	static #dbInstance = {
		dev() {
			return new Sequelize("cognitum_dev", "cognitum_dev", "cognitum_dev", {
				logging: cognitumSettings.get("debug"),
				host: "localhost",
				dialect: "mariadb",
				dialectOptions: {
					timezone: process.env.TZ
				}
			});
		},

		mariadb() {
			let db = databaseConfig.get("mariadb");
			let pool = databaseConfig.get("pool");
			return new Sequelize(db.database, db.username, db.password, {
				logging: cognitumSettings.get("debug"),
				host: db.host,
				dialect: "mariadb",
				dialectOptions: {
					timezone: "Z"
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
