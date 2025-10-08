require('dotenv').config()

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://aurora:aurora_password@localhost:5432/aurora_identity',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',

    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}

module.exports = config

