const production = require("./db.json");

module.exports = {
	development: {
		database: "",
		username: "",
		password: "",
		host: "localhost",
		port: 3306,
		dialect: "mariadb"
	},
	production: {
		database: production[production.dbtype].database,
		username: production[production.dbtype].username,
		password: production[production.dbtype].password,
		host: production[production.dbtype].host,
		// TODO Field with port in database configuration file
		port: 3306,
		dialect: production.dbtype
	}
	// TODO Test sequelize-cli configuration
};
