const _ = require('lodash');
const {Model} = require('sequelize');

class BaseModel extends Model {
    static attributes;
    static options;
    static initialize(sequelize) {
        this.init(this.attributes, _.merge(this.options, {sequelize}));
    }
}

module.exports = BaseModel;