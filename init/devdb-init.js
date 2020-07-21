/* eslint-disable no-useless-catch */
const mariadb = require("mariadb");
const readlineSync = require("readline-sync");

console.log("Creating \"cognitum_dev\" database and \"cognitum_dev\" user with \"cognitum_dev\" password if it not exists.");
let username = readlineSync.question("mariadb root username: ");
let password = readlineSync.question("mariadb root password: ", { hideEchoBack: true });

const db = mariadb.createPool({
	"host": "localhost",
	"user": username,
	password,
	"idleTimeout": 0
});
(async () => {
	let connection;
	try {
		connection = await db.getConnection();
		await connection.query("CREATE DATABASE IF NOT EXISTS cognitum_dev");
		await connection.query("CREATE USER IF NOT EXISTS 'cognitum_dev'@'localhost' IDENTIFIED BY 'cognitum_dev'");
		await connection.query("GRANT ALL PRIVILEGES ON cognitum_dev.* TO 'cognitum_dev'@'localhost'");
		await connection.query("FLUSH PRIVILEGES");
		console.log("Database and user created.");
	} catch (error) {
		throw error;
	} finally {
		if (connection) connection.release();
	}
	process.exit();
})();
