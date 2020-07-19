const production = require("./db.json");

module.exports = {
	development: {
		database: "cognitum_dev",
		username: "cognitum_dev",
		password: "cognitum_dev",
		host: "localhost",
		port: 3306,
		dialect: "mariadb"
	},
	production: {
		database: production[production.dbtype].database,
		username: production[production.dbtype].host,
		password: production[production.dbtype].password,
		host: production[production.dbtype].host,
		// TODO Field with port in database configuration file
		port: 3306,
		dialect: production.dbtype
	}
	// TODO Test sequelize-cli configuration
};
