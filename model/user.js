const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const userModel = sequelize.define('users', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    searches: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    timestamps: false
});

module.exports = userModel;