'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'chat_sessions',
          key: 'session_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      sender_type: {
        type: Sequelize.ENUM('user', 'admin', 'bot'),
        allowNull: false,
        defaultValue: 'user'
      },
      message_type: {
        type: Sequelize.ENUM('text', 'image', 'file', 'quick_reply'),
        allowNull: false,
        defaultValue: 'text'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'chat_messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('chat_messages', ['session_id', 'created_at']);
    await queryInterface.addIndex('chat_messages', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_messages');
  }
};
