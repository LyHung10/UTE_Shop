// models/flashsaleproduct.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FlashSaleProduct extends Model {
    static associate(models) {
      FlashSaleProduct.belongsTo(models.FlashSale, {
        foreignKey: 'flash_sale_id',
        as: 'flash_sale'
      });
      FlashSaleProduct.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      FlashSaleProduct.hasMany(models.FlashSaleOrder, {
        foreignKey: 'flash_sale_product_id'
      });
    }
  }
  FlashSaleProduct.init(
    {
      flash_sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      flash_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      original_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      stock_flash_sale: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sold_flash_sale: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      limit_per_user: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'FlashSaleProduct',
      tableName: 'flash_sale_products',
      underscored: true,
      indexes: [
        {
          fields: ['flash_sale_id', 'product_id']
        }
      ]
    }
  );
  return FlashSaleProduct;
};