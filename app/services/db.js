const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    },
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.categoryModel = require('../models/categoryModel')(sequelize, Sequelize);
db.product = require('../models/productModel')(sequelize, Sequelize);
db.imagesModel = require('../models/imageModel')(sequelize, Sequelize);

db.product.associate(db);
db.categoryModel.associate(db);
db.imagesModel.associate(db);

module.exports = db;
