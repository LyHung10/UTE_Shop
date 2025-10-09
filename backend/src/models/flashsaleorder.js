// models/flashsaleorder.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FlashSaleOrder extends Model {
    static associate(models) {
      FlashSaleOrder.belongsTo(models.FlashSale, {
        foreignKey: 'flash_sale_id'
      });
      FlashSaleOrder.belongsTo(models.FlashSaleProduct, {
        foreignKey: 'flash_sale_product_id'
      });
      FlashSaleOrder.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
      FlashSaleOrder.belongsTo(models.Order, {
        foreignKey: 'order_id'
      });
    }
  }
  FlashSaleOrder.init(
    {
      flash_sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      flash_sale_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      flash_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'FlashSaleOrder',
      tableName: 'flash_sale_orders',
      underscored: true,
      indexes: [
        {
          fields: ['user_id', 'flash_sale_id', 'flash_sale_product_id']
        }
      ]
    }
  );
  return FlashSaleOrder;
};