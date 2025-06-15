const authService = require('../services/authService');

const authController = {
  signup: async (req, res) => {
    try {
      const { email, password, role, ashaId, docId, name, age, gender, mobile } = req.body;
      const result = await authService.signup(email, password, role, ashaId, docId, name, age, gender, mobile);
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Email and password are required') {
        return res.status(400).json({ message: error.message });
      } else if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error.message === 'Email and password are required' || error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  },
};

module.exports = authController; 