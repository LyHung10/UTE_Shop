// models/flashsale.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FlashSale extends Model {
    static associate(models) {
      FlashSale.hasMany(models.FlashSaleProduct, {
        foreignKey: 'flash_sale_id',
        as: 'flash_sale_products'
      });
      FlashSale.hasMany(models.FlashSaleOrder, {
        foreignKey: 'flash_sale_id'
      });
    }
  }
  FlashSale.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: DataTypes.TEXT,
      start_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('upcoming', 'active', 'ended', 'cancelled'),
        defaultValue: 'upcoming'
      },
      banner_image: DataTypes.STRING,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'FlashSale',
      tableName: 'flash_sales',
      underscored: true,
    }
  );
  return FlashSale;
};