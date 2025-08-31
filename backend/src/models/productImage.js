'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
        static associate(models) {
            ProductImage.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    ProductImage.init(
        {
            product_id: DataTypes.INTEGER,
            url: DataTypes.STRING,
            alt: DataTypes.STRING,
            sort_order: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'ProductImage',
            tableName: 'product_images',
            underscored: true
        }
    );
    return ProductImage;
};
