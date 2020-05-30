const path = require("path");

module.exports = {
    /**
     * Centralized logging function
     * @param {"log" | "error"| "warn" | "info" | "success"} type
     * @param {string} message
     */
    log(type, message) {
        const now = new Date();
    },

    fileName(filename = "") {
        return filename.split('.').slice(0, 1 - +filename.includes(".") * 2);
    },

    fileExtension(filename = "") {
        return filename.split('.').pop();
    }
};