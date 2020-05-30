const path = require("path");

module.exports = {
    /**
     * Centralized logging function
     * @param {"log" | "error"| "warn" | "info" | "success"} type
     * @param {string} message
     *
     * @todo Different logging colors from config used by type
     * @todo Different logging "headers" for every type
     */
    log(type, message) {
        const now = new Date();
        console.log(`${now.toLocaleString()} [${type}] ${message}`);
    },

    fileName(filename = "") {
        return filename.split('.').slice(0, 1 - +filename.includes(".") * 2);
    },

    fileExtension(filename = "") {
        return filename.split('.').pop();
    }
};