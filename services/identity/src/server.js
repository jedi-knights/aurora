const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const config = require('./config')
const { logger } = require('./shared/logger/logger')
const { connect } = require('./infrastructure/database/postgresql/connection')
const { errorHandler } = require('./infrastructure/http/middlewares/errorHandler')

// Repositories
const { PostgresUserRepository } = require('./infrastructure/database/postgresql/repositories/PostgresUserRepository')

// Use Cases
const { RegisterUserUseCase } = require('./application/useCases/RegisterUserUseCase')
const { LoginUserUseCase } = require('./application/useCases/LoginUserUseCase')
const { VerifyTokenUseCase } = require('./application/useCases/VerifyTokenUseCase')

// Controllers
const { AuthController } = require('./infrastructure/http/controllers/AuthController')
const { createAuthRoutes } = require('./infrastructure/http/routes/authRoutes')

async function startServer() {
    // Connect to database
    const pool = await connect()
    logger.info('Database connected')

    // Create Express app
    const app = express()

    // Middleware
    app.use(helmet())
    app.use(cors({ origin: config.frontendUrl, credentials: true }))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(morgan('combined'))

    // Dependency Injection
    const userRepository = new PostgresUserRepository(pool)

    const registerUserUseCase = new RegisterUserUseCase(userRepository)
    const loginUserUseCase = new LoginUserUseCase(userRepository)
    const verifyTokenUseCase = new VerifyTokenUseCase(userRepository)

    const authController = new AuthController({
        registerUserUseCase,
        loginUserUseCase,
        verifyTokenUseCase
    })

    // Routes
    app.use('/auth', createAuthRoutes(authController))

    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'identity',
            timestamp: new Date().toISOString()
        })
    })

    // Error handling
    app.use(errorHandler)

    // Start server
    app.listen(config.port, () => {
        logger.info(`Identity service running on port ${config.port}`)
    })
}

// Start
startServer().catch(err => {
    logger.error('Failed to start server:', err)
    process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server')
    process.exit(0)
})

