const BaseModel = require('./BaseModel.js');
const Guild = require('./Guild.js');
const Sequelize = require('sequelize');

class GuildChannel extends BaseModel {
    static attributes = {
        id: {
            type: Sequelize.STRING,
            field: "channel_id",
            allowNull: false,
            primaryKey: true,
            validate: {
                len: [1, 50]
            }
        },
        guildId: {
            type: Sequelize.STRING,
            field: "guild_id",
            allowNull: false,
            validate: {
                len: [1, 50]
            },
            references: {
                model: Guild,
                key: "discord_id"
            }
        },
        score: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        hidden: {
            type: Sequelize.TINYINT,
            allowNull: false,
            defaultValue: 0
        }
    };

    static options = {
        timestamps: false
    };
}

module.exports = GuildChannel;