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
const authenticateToken = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const db = require('./models'); // Import the Sequelize models and connection

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Auth Routes
app.use('/', authRoutes);

// Proxy to Microservice
app.use('/GatewayAPI', authenticateToken, createProxyMiddleware({
  target: config.MICROSERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/GatewapAPI': '/api', // retain /api prefix when forwarding to microservice
  },
}));

// Basic test route
app.get('/', (req, res) => {
  res.send('API Gateway is running!');
});

const PORT = process.env.PORT || 3001;

// Sync Sequelize models with the database and start the server
// db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Connected to database: ${config.database[process.env.NODE_ENV || 'development'].database}`);
    console.log('Server successfully started and listening.');
  });
// }).catch(err => {
//   console.error('Unable to connect to the database:', err);
// }); 