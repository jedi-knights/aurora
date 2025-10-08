require('dotenv').config()

const config = {
    port: process.env.PORT || 4002,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aurora_journals',

    // External services
    identityServiceUrl: process.env.IDENTITY_SERVICE_URL || 'http://localhost:5000',

    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}

module.exports = config

