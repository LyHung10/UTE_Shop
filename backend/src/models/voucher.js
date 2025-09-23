'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Voucher extends Model {
        static associate(models) {
            // 1 voucher có thể áp dụng cho nhiều order
            Voucher.hasMany(models.Order, { foreignKey: 'voucher_id', as: 'orders' });
        }
    }

    Voucher.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false, // mã voucher bắt buộc phải có
            },
            description: {
                type: DataTypes.TEXT,
            },
            discount_type: {
                type: DataTypes.ENUM('percent', 'fixed'),
                allowNull: false,
                defaultValue: 'percent',
            },
            discount_value: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            max_discount: {
                type: DataTypes.DECIMAL(12, 2), // dùng khi discount_type = percent
                allowNull: true,
            },
            min_order_value: {
                type: DataTypes.DECIMAL(12, 2),
                defaultValue: 0,
            },
            usage_limit: {
                type: DataTypes.INTEGER,
                defaultValue: 0, // 0 = không giới hạn
            },
            used_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('active', 'expired', 'disabled'),
                defaultValue: 'active',
            },
        },
        {
            sequelize,
            modelName: 'Voucher',
            tableName: 'vouchers',
            underscored: true,
        }
    );

    return Voucher;
};
