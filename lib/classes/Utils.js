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
     * Get file name from basename with extension.
     * @param {string} basename Filename with extension.
     * @return {string} Filename without extension. If no extensions available it returns the whole basename.
     * @example
     * let basenameWithExtension = "example.json";
     * let basenameWithoutExtension = "README";
     *
     * Utils.fileName(basenameWithExtension);
     * // "example"
     * Utils.fileName(basenameWithoutExtension);
     * // "README"
     */
    fileName(basename) {
        return basename.split('.')
            .slice(0, 1 - +basename.includes(".") * 2)
            .join(".");
    },

    /**
     * Get file extension from basename.
     * @param {string} basename Filename with extension.
     * @return {string|boolean} Extension only. If no extension available then it returns `false`.
     * @example
     * let basenameWithExtension = "example.json";
     * let basenameWithoutExtension = "README";
     *
     * Utils.fileExtension(basenameWithExtension);
     * // "json"
     * Utils.fileExtension(basenameWithoutExtension);
     * // false
     */
    fileExtension(basename) {
        const fileParts = basename.split('.');
        if (fileParts <= 1)
            return false;
        return fileParts.pop();
    }
};