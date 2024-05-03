// model/InstagramMutuals.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const InstagramData = sequelize.define('instagram_users_data', {
    id: {
        field: 'id',
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: true,
    },
    mutuals: {
        field: 'mutuals', 
        type: DataTypes.JSON, 
        allowNull: true
    },
    processed:{
        field: 'processed',
        type: DataTypes.BOOLEAN,
    }
},
{
    timestamps: false,
});

module.exports = InstagramData;
