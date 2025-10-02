'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Address extends Model {
        static associate(models) {
            Address.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        }
    }

    Address.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            name_order: DataTypes.STRING,
            phone_order: DataTypes.STRING,
            address_line: {
                type: DataTypes.STRING,
                allowNull: false
            },
            city: DataTypes.STRING,
            district: DataTypes.STRING,
            ward: DataTypes.STRING,
            postal_code: DataTypes.STRING,
            lat: {
                type: DataTypes.FLOAT,
            },
            lon: {
                type: DataTypes.FLOAT,
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'Address',
            tableName: 'addresses',
            underscored: true
        }
    );

    return Address;
};
