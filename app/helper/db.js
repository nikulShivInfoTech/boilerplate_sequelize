const logger = require('./logger');
const {sequelize}=require('../services/db')
const database = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to the database has been established successfully.');
    } catch (err) {
        logger.error('Unable to connect to the database:', err);
    }
};
module.exports = { database };

