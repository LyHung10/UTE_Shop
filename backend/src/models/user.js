'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 1 user có thể có nhiều otpCode
      User.hasMany(models.OtpCode, { foreignKey: 'user_id' });
      // 1 user có thể có nhiều refreshToken
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });

      User.hasMany(models.Order, { foreignKey: 'user_id' });
      User.hasMany(models.Review, { foreignKey: 'user_id' });
      User.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      gender: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
      loyalty_points: DataTypes.INTEGER,
      is_verified: DataTypes.BOOLEAN,
      role_id: DataTypes.STRING,
      position_id: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,

    }
  );
  return User;
};
