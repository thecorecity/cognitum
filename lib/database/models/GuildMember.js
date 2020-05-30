const BaseModel = require('./BaseModel.js');
const Guild = require('./Guild.js');
const User = require('./User.js');
const Sequelize = require('sequelize');

class GuildMember extends BaseModel {
    static attributes = {
        id: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        guildId: {
            type: Sequelize.STRING,
            field: "guild_id",
            allowNull: false,
            references: {
                model: Guild,
                key: "discord_id"
            },
            validate: {
                len: [1, 50]
            }
        },
        userId: {
            type: Sequelize.STRING,
            field: "member_id",
            allowNull: false,
            references: {
                model: User,
                key: "discord_id"
            },
            validate: {
                len: [1, 50]
            }
        },
        score: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        localAccess: {
            type: Sequelize.TINYINT.UNSIGNED,
            field: "local_access",
            allowNull: false,
            defaultValue: 0
        },
        activity: {
            type: Sequelize.BIGINT.UNSIGNED,
            defaultValue: 0
        },
        voice: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        }
    };

    static options = {
        timestamps: false
    };
}

module.exports = GuildMember;