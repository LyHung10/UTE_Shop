'use strict';
const { Model } = require('sequelize');
// models/Payment.js
module.exports = (sequelize, DataTypes) => {
    class Payment extends Model {
        static associate(models) {
            Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
        }
    }
    Payment.init({
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
        },
        method: {
            type: DataTypes.STRING, // 'COD', 'E_WALLET', 'CARD', ...
            allowNull: false
        },
        status: {
            type: DataTypes.STRING, // 'pending', 'paid', 'failed'
            allowNull: false,
            defaultValue: 'pending'
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        meta: {
            type: DataTypes.JSON, // lưu thông tin mở rộng (transaction id, e-wallet payload...)
            allowNull: true
        }
    },
        {
            sequelize,
            modelName: 'Payment',
            tableName: 'payments',
            underscored: true,
        });

    return Payment;
};
