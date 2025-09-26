// models/favoriteProduct.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FavoriteProduct extends Model {
        static associate(models) {
            FavoriteProduct.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
            FavoriteProduct.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
        }
    }

    FavoriteProduct.init(
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'FavoriteProduct',
            tableName: 'favorite_products',
            underscored: true,
            timestamps: true,
        }
    );

    return FavoriteProduct;
};
