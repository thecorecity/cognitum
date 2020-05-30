const BaseModel = require('./BaseModel.js');
const Sequelize = require('sequelize');

class User extends BaseModel {
    static attributes = {
        id: {
            type: Sequelize.STRING,
            field: "discord_id",
            primaryKey: true,
            allowNull: false,
            validate: {
                len: [1, 50]
            }
        },
        access: {
            type: Sequelize.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        score: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        }
    };

    static options = {
        timestamps: false
    }
}

module.exports = User;