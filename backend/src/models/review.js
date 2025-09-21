'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.Product, { foreignKey: 'product_id' });
            Review.belongsTo(models.User, { foreignKey: 'user_id' });
            Review.belongsTo(models.Order, { foreignKey: 'order_id' });// 1 review thuộc về 1 order
        }
    }
    Review.init({
        product_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        order_id: DataTypes.INTEGER,
        rating: DataTypes.INTEGER,
        text: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'Review',
        tableName: 'reviews',
        underscored: true
    });
    return Review;
};
