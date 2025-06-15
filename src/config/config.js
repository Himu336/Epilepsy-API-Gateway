module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey',
  MICROSERVICE_URL: process.env.MICROSERVICE_URL || 'https://epilepsy-form-service.onrender.com', // Replace with your Render microservice URL
  database: {
    development: {
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || null,
      database: process.env.DB_NAME || 'epilepsy_gateway_db',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql'
    },
    production: {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: false, // Disable logging for production
    },
  },
}; 