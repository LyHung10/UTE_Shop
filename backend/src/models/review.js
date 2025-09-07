'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    Review.init({
        product_id: DataTypes.INTEGER,
        user_name: DataTypes.STRING,
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
