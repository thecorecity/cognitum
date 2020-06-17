const path = require("path");

/**
 * @typedef {"log"|"error"|"warn"|"info"|"success"} LogType Available types of log. This types will be used in future
 *     for better styling of logging and enabling different logs channels to show in console prompt.
 */

module.exports = {
    /**
     * Centralized logging function. Used for unified style of logging.
     * @param {LogType} type Type of log.
     * @param {string} message Log message to show.
     *
     * @todo Different logging colors from config used by type
     * @todo Different logging "headers" for every type
     */
    log(type, message) {
        const now = new Date();
        console.log(`${now.toLocaleString()} [${type}] ${message}`);
    },

    /**
     * Get file name from filename with extension.
     * @param {string} filename Filename with extension.
     * @return {string} Filename without extension.
     */
    fileName(filename) {
        return filename.split('.').slice(0, 1 - +filename.includes(".") * 2).join(".");
    },

    /**
     * Get file extension from filename and extension.
     * @param {string} filename Filename with extension.
     * @return {string} Extension only.
     */
    fileExtension(filename) {
        return filename.split('.').pop();
    }
};