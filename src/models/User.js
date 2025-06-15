// This file is a placeholder for your Sequelize User model.
// In a real application, you would define your User model here
// using Sequelize to interact with your Railway-hosted database.

// Example (uncomment and modify when integrating Sequelize):
/*
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a database connection config

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
*/

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here if needed
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('patient', 'doctor', 'asha'),
      allowNull: false,
      defaultValue: 'patient',
    },
    ashaId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    docId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users', // Explicitly setting table name for clarity
    timestamps: true,
  });
  return User;
}; 