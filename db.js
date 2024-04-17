const {Sequelize} = require ('sequelize');

const sequalize = new Sequelize({
    dialect: 'postgres',
    host: "socialdna.c5io68wm06kn.us-east-1.rds.amazonaws.com",
    port: "5432",
    username: "postgres",
    password: "admin123",
    database: "postgres",
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
            // TODO: define custom certificate: https://node-postgres.com/features/ssl#self-signed-cert
        },
    },
});
 
module.exports = sequalize;