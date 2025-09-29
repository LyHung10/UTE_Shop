'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ChatSession extends Model {
        static associate(models) {
            ChatSession.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
                required: false
            });
            ChatSession.hasMany(models.ChatMessage, {
                foreignKey: 'session_id',
                sourceKey: 'session_id',
                as: 'messages'
            });
        }
    }

    ChatSession.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            session_id: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true, // guest
            },
            guest_info: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('active', 'waiting', 'closed'),
                defaultValue: 'active'
            },
            assigned_to: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            priority: {
                type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
                defaultValue: 'medium'
            },
            tags: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            last_message_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            customer_satisfaction: {
                type: DataTypes.INTEGER,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: 'ChatSession',
            tableName: 'chat_sessions',
            underscored: true,
            indexes: [
                { fields: ['session_id'] },
                { fields: ['user_id'] },
                { fields: ['status', 'created_at'] }
            ]
        }
    );

    return ChatSession;
};
