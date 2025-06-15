const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../models'); // Import the Sequelize models
const User = db.User; // Access the User model

const authService = {
  signup: async (username, password) => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Check if user already exists in the database
    const existingUser = await User.findOne({ where: { username: username } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user in the database
    const newUser = await User.create({ username, password: hashedPassword });
    return { message: 'User created successfully', userId: newUser.id };
  },

  login: async (username, password) => {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Find user in the database
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ username: user.username, userId: user.id }, config.JWT_SECRET, { expiresIn: '1h' });
    return { token };
  },
};

module.exports = authService; 