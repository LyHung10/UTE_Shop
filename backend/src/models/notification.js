// backend/src/models/notification.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Một user có nhiều notification
      Notification.belongsTo(models.User, { 
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
        defaultValue: 'info'
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      related_entity: {
        type: DataTypes.STRING, // 'order', 'review', 'system', etc.
        allowNull: true
      },
      entity_id: {
        type: DataTypes.INTEGER, // ID của entity liên quan
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      underscored: true,
      timestamps: true
    }
  );
  
  return Notification;
};