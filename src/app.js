require('dotenv').config();

process.on('uncaughtException', err => {
  console.error('API Gateway Uncaught Exception:', err);
  process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('API Gateway Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: process.exit(1); depending on how critical unhandled rejections are for your app
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config/config');
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware'); // Import both
const authRoutes = require('./routes/authRoutes');
const db = require('./models');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Auth Routes (Publicly accessible for signup/login)
app.use('/', authRoutes);

// Generic proxy setup with request transformation
const microserviceProxy = () => {
  console.log('Proxying requests to:', config.MICROSERVICE_URL); // Diagnostic log
  return createProxyMiddleware({
    target: config.MICROSERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/gatewayApi': '/api', // retain /api prefix when forwarding to microservice
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ message: 'Proxy service unavailable or error.' });
    },
  });
};

app.use('/gatewayApi', authenticateToken, microserviceProxy());


// Basic test route
app.get('/', (req, res) => {
  res.send('API Gateway is running!');
});

const PORT = process.env.PORT || 3001;

// Sync Sequelize models with the database and start the server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Connected to database: ${config.database[process.env.NODE_ENV || 'development'].database}`);
    console.log('Server successfully started and listening.');
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
}); 