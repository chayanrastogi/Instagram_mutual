// model/InstagramMutuals.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const InstagramData = sequelize.define('instagram_user_data', {
    jobid: {
        field: 'jobid',
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: true,
    },
    mutuals: {
        field: 'mutuals', 
        type: DataTypes.ARRAY(DataTypes.JSONB), 
        allowNull: true
    },
    username: {
        field: 'username',
        type: DataTypes.TEXT,
        allowNull: true,
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
