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

    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      address: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      gender: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
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
