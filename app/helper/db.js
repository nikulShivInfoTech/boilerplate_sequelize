
const logger = require('./logger');
const { sequelize } = require('../services/db');

const database = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection has been established successfully.');

        await sequelize.sync({ alter: true });
        logger.info('✅ All models were synchronized successfully.');
    } catch (err) {
        logger.error('❌ Unable to connect to the database:', err);
    }
};

module.exports = { database, sequelize };

