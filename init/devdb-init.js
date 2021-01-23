/* eslint-disable no-useless-catch */
const mariadb = require("mariadb");
const readlineSync = require("readline-sync");

console.log("\n\n == Database initialization == ");
console.log("Creating \"cognitum_dev\" database and \"cognitum_dev\" user with \"cognitum_dev\" password if it not exists.\n");

let hostname = readlineSync.question("mariadb hostname (default: localhost): ");
let port = readlineSync.question("mariadb port (default: 3306): ");
let username = readlineSync.question("mariadb root username (default: root): ");
let password = readlineSync.question("mariadb root password: ", { hideEchoBack: true });

if (!hostname?.length)
	hostname = "localhost";
if (!port?.length) {
	port = 3306;
} else {
	port = parseInt(port);
	if (!isFinite(port) || port < 1 || port > 65535) {
		console.warn("Incorrect port passed. Using default port instead!");
		port = 3306;
	}
}
if (!username?.length)
	username = "root";
if (!password?.length)
	console.warn("Password not passed! We will try to log in without password.");

const db = mariadb.createPool({
	host: hostname,
	port,
	user: username,
	password,
	idleTimeout: 0
});

(async () => {
	let connection;
	try {
		console.log("Creating connection...");
		connection = await db.getConnection();
		console.log("Creating database...");
		await connection.query("CREATE DATABASE IF NOT EXISTS cognitum_dev");
		console.log("Creating user for this database...");
		await connection.query("CREATE USER IF NOT EXISTS 'cognitum_dev'@'localhost' IDENTIFIED BY 'cognitum_dev'");
		console.log("Granting privileges for new user...");
		await connection.query("GRANT ALL PRIVILEGES ON cognitum_dev.* TO 'cognitum_dev'@'localhost'");
		await connection.query("FLUSH PRIVILEGES");
		console.log("Database and user created!");
	} catch (error) {
		console.error("Failed to perform this action! Error details:");
		console.error(error);
	} finally {
		if (connection) connection.release();
	}
	process.exit();
})();
