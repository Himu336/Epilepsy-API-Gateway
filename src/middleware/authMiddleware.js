const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Access Denied: Invalid Token!' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized: User role not found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Only ${allowedRoles.join(', ')} can access this resource.` });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles }; 