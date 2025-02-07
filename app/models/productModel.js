const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const product = sequelize.define('product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'categories',
                key: 'id',
            },
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        timestamps: true,
    });

    product.associate = (models) => {
        product.belongsTo(models.categoryModel, { foreignKey: 'category_id', as: 'category' });
        product.hasMany(models.imagesModel, { foreignKey: 'product_id', as: 'images' });
    };

    return product;
};
