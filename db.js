const {Sequelize} = require ('sequelize');

const sequalize = new Sequelize({
    dialect: 'postgres',
    host: "trumanscore.c5otns6mlwfh.us-east-1.rds.amazonaws.com",
    port: "5432",
    username: "KronusDBUser",
    password: "Kronus123",
    database: "postgres",
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
            // TODO: define custom certificate: https://node-postgres.com/features/ssl#self-signed-cert
        },
    },
});
 
module.exports = sequalize;