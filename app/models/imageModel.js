const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const imagesModel = sequelize.define('images', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'products',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        timestamps: true,
    });
    imagesModel.associate = (models) => {
        imagesModel.belongsTo(models.product, { foreignKey: 'product_id', as: 'product' });
    };
    return imagesModel;
};
