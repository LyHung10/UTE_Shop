'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ChatMessage extends Model {
        static associate(models) {
            ChatMessage.belongsTo(models.User, { 
                foreignKey: 'user_id', 
                as: 'user',
                required: false 
            });
            ChatMessage.belongsTo(models.ChatSession, {
                foreignKey: 'session_id',
                targetKey: 'session_id',
                as: 'session'
            });
        }
    }
    
    ChatMessage.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true, // guest chat
            },
            session_id: {
                type: DataTypes.STRING,
                allowNull: false, // unique session cho mỗi chat
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            sender_type: {
                type: DataTypes.ENUM('user', 'admin', 'bot'),
                allowNull: false,
                defaultValue: 'user'
            },
            message_type: {
                type: DataTypes.ENUM('text', 'image', 'file', 'quick_reply'),
                allowNull: false,
                defaultValue: 'text'
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            parent_id: {
                type: DataTypes.INTEGER,
                allowNull: true, // reply tới message khác
            }
        },
        {
            sequelize,
            modelName: 'ChatMessage',
            tableName: 'chat_messages',
            underscored: true,
            indexes: [
                { fields: ['session_id', 'created_at'] },
                { fields: ['user_id'] }
            ]
        }
    );
    
    return ChatMessage;
};
