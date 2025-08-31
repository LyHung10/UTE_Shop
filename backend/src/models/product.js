'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.Category, { foreignKey: 'category_id' });
            Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images' });
            Product.hasOne(models.Inventory, { foreignKey: 'product_id', as: 'inventory' });
            Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
        }
    }
    Product.init(
        {
            name: DataTypes.STRING,
            slug: DataTypes.STRING,
            short_description: DataTypes.STRING,
            description: DataTypes.TEXT,
            price: DataTypes.DECIMAL(12, 2),
            original_price: DataTypes.DECIMAL(12, 2),
            discount_percent: DataTypes.INTEGER,
            view_count: DataTypes.INTEGER,
            sale_count: DataTypes.INTEGER,
            is_active: DataTypes.BOOLEAN,
            featured: DataTypes.BOOLEAN
        },
        {
            sequelize,
            modelName: 'Product',
            tableName: 'products',
            underscored: true
        }
    );
    return Product;
};
