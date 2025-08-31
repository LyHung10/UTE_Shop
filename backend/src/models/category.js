'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            Category.hasMany(models.Product, { foreignKey: 'category_id' });
        }
    }
    Category.init(
        {
            name: DataTypes.STRING,
            slug: DataTypes.STRING, // dùng để thay cho số hiệu
            description: DataTypes.TEXT
        },
        {
            sequelize,
            modelName: 'Category',
            tableName: 'categories',
            underscored: true
        }
    );
    return Category;
};
