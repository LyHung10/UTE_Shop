'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OtpCode extends Model {
    static associate(models) {
      OtpCode.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  OtpCode.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      code_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      expired_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'OtpCode',
      tableName: 'otp_codes',
      underscored: true, // map camelCase <-> snake_case tự động
    }
  );

  return OtpCode;
};
