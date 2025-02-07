// categoryModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const categoryModel = sequelize.define('category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: true,
    });
    categoryModel.associate = (models) => {
        categoryModel.hasMany(models.product, { foreignKey: 'category_id', as: 'products' });
      };
    return categoryModel;
};
