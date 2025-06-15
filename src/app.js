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
const microserviceProxy = (allowedRoles = []) => createProxyMiddleware({
  target: config.MICROSERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // retain /api prefix when forwarding to microservice
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user role and ID to the microservice for fine-grained authorization
    if (req.user && req.user.role) {
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
    if (req.user && req.user.userId) {
      proxyReq.setHeader('X-User-Id', req.user.userId.toString()); // Ensure it's a string
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ message: 'Proxy service unavailable or error.' });
  },
});

// Protected Microservice Routes with RBAC
// Checklists Data
app.get('/api/getChecklistsAll', authenticateToken, authorizeRoles(['doctor', 'asha']), microserviceProxy());
app.get('/api/getChecklistById/:id', authenticateToken, authorizeRoles(['patient', 'doctor', 'asha']), microserviceProxy());
app.post('/api/createChecklist', authenticateToken, authorizeRoles(['doctor', 'asha']), microserviceProxy());

// Patients Data
app.get('/api/getPatientsAll', authenticateToken, authorizeRoles(['doctor']), microserviceProxy());
app.get('/api/getPatientById/:id', authenticateToken, authorizeRoles(['patient', 'doctor', 'asha']), microserviceProxy());
app.post('/api/createPatient', authenticateToken, authorizeRoles(['doctor']), microserviceProxy());
app.put('/api/updatePatientById/:id', authenticateToken, authorizeRoles(['doctor']), microserviceProxy());
app.delete('/api/deletePatientById/:id', authenticateToken, authorizeRoles(['doctor']), microserviceProxy());

// ASHA Data (Assuming ASHA-specific endpoints or specific views)
// If there are other ASHA endpoints, add them here.

// Centralized Data System
app.get('/api/getHeatmap', authenticateToken, authorizeRoles(['doctor']), microserviceProxy());

// Fallback for any other /api routes that are authenticated but don't have specific role checks
// This should be at the very end of /api routes that need authentication
app.use('/api', authenticateToken, microserviceProxy());


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