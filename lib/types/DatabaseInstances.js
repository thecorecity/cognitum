// eslint-disable-next-line no-unused-vars
const Database = require("../classes/Database.js");

/**
 * Result of statistics push. Contains all database instances resolved on pushing.
 *
 * @typedef {Object} DatabaseInstances
 * @property {Database.Guild} guild Guild database instance.
 * @property {Database.User} user User database instance.
 * @property {Database.GuildMember} member Guild member database instance.
 * @property {Database.GuildChannel} channel Guild channel database instance.
 */
