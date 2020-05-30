const BaseModel = require('./BaseModel.js');
const Sequelize = require('sequelize');

class Guild extends BaseModel {
    static attributes = {
        id: {
            type: Sequelize.STRING,
            field: "discord_id",
            allowNull: false,
            primaryKey: true,
            validate: {
                len: [1, 50]
            }
        },
        prefix: {
            type: Sequelize.STRING,
            validate: {
                len: [1, 3]
            }
        },
        access: {
            type: Sequelize.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        logs: {
            type: Sequelize.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        welcome: {
            type: Sequelize.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        nickname: {
            type: Sequelize.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        score: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    };

    static options = {
        timestamps: false,
        tableName: "guilds"
    };
}

module.exports = Guild;