'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      email: { type: Sequelize.STRING, unique: true },
      password: { type: Sequelize.STRING },
      first_name: { type: Sequelize.STRING },
      last_name: { type: Sequelize.STRING },
      phone_number: { type: Sequelize.STRING },
      gender: { type: Sequelize.BOOLEAN },
      image: { type: Sequelize.STRING },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      role_id: { type: Sequelize.STRING },
      position_id: { type: Sequelize.STRING },
      created_at: 
      { allowNull: false,
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
      },
      updated_at: 
      { allowNull: false, 
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
