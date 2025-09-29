'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_sessions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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
      guest_info: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'waiting', 'closed'),
        defaultValue: 'active'
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      last_message_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      customer_satisfaction: {
        type: Sequelize.INTEGER,
        allowNull: true
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

    await queryInterface.addIndex('chat_sessions', ['session_id']);
    await queryInterface.addIndex('chat_sessions', ['user_id']);
    await queryInterface.addIndex('chat_sessions', ['status', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_sessions');
  }
};
