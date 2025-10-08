require('dotenv').config()

const config = {
  port: process.env.PORT || 4003,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://aurora:aurora_password@localhost:5432/aurora_planning',
  
  // External services
  identityServiceUrl: process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000',
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}

module.exports = config

