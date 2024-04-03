// model/InstagramMutuals.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const InstagramMutuals = sequelize.define('instagram_mutuals_data', {
    user_id: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: true,
    },
    mutuals_data: {
        field: 'mutuals_data', 
        type: DataTypes.ARRAY(DataTypes.JSONB), 
        allowNull: true
    },
    top10_mutuals: {
        field: 'top10_mutuals', 
        type: DataTypes.ARRAY(DataTypes.JSONB), 
        allowNull: true
    }
},
{
    timestamps: false,
});

module.exports = InstagramMutuals;
