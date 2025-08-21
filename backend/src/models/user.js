'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // 1 user có thể có nhiều otpCode
      User.hasMany(models.OtpCode, { foreignKey: 'userId' });
      // 1 user có thể có nhiều refreshToken
      User.hasMany(models.RefreshToken, { foreignKey: 'userId' });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      gender: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
      is_verified: DataTypes.BOOLEAN,
      roleId: DataTypes.STRING,
      positionId: DataTypes.STRING
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
