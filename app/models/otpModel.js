const { DataTypes } = require('sequelize');
const { sequelize } = require('../helper/db');

const Otps = sequelize.define('Otps', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', 
            key: 'id',
        },
    },
    otp: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Otps',  
    timestamps: true,    
    freezeTableName: true, 
});

module.exports = Otps;
