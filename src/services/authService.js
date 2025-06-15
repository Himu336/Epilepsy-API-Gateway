const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../models'); // Import the Sequelize models
const User = db.User; // Access the User model

const authService = {
  signup: async (email, password, role, ashaId, docId, name, age, gender, mobile) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user already exists in the database by email
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Prepare user data to be created
    const userData = {
      email,
      password: hashedPassword,
      role: role || 'patient', // Use provided role or default to 'patient'
      name,    // Add new fields
      age,     // Add new fields
      gender,  // Add new fields
      mobile,  // Add new fields
    };

    // Conditionally add ashaId or docId based on role
    if (userData.role === 'asha' && ashaId) {
      userData.ashaId = ashaId;
    } else if (userData.role === 'doctor' && docId) {
      userData.docId = docId;
    }

    // Create new user in the database
    const newUser = await User.create(userData);
    return { message: 'User created successfully', userId: newUser.id };
  },

  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user in the database by email
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Include relevant user details in the JWT payload
    const tokenPayload = {
      email: user.email,
      userId: user.id,
      role: user.role,
      name: user.name,      // Add new fields to JWT
      age: user.age,
      gender: user.gender,
      mobile: user.mobile,
    };
    if (user.ashaId) {
      tokenPayload.ashaId = user.ashaId;
    }
    if (user.docId) {
      tokenPayload.docId = user.docId;
    }

    const token = jwt.sign(tokenPayload, config.JWT_SECRET, { expiresIn: '1h' });
    return { token };
  },
};

module.exports = authService; 