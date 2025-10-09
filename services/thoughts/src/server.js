const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const config = require('./config')
const { logger } = require('./shared/logger/logger')
const { connect } = require('./infrastructure/database/mongodb/connection')
const { errorHandler } = require('./infrastructure/http/middlewares/errorHandler')
const { authMiddleware } = require('./infrastructure/http/middlewares/authMiddleware')

// Models
const { ThoughtModel } = require('./infrastructure/database/mongodb/models/ThoughtModel')

// Repositories
const { MongoThoughtRepository } = require('./infrastructure/database/mongodb/repositories/MongoThoughtRepository')

// Use Cases
const { CreateThoughtUseCase } = require('./application/useCases/CreateThoughtUseCase')
const { GetThoughtUseCase } = require('./application/useCases/GetThoughtUseCase')
const { GetThoughtsUseCase } = require('./application/useCases/GetThoughtsUseCase')
const { UpdateThoughtUseCase } = require('./application/useCases/UpdateThoughtUseCase')
const { DeleteThoughtUseCase } = require('./application/useCases/DeleteThoughtUseCase')
const { SearchThoughtsUseCase } = require('./application/useCases/SearchThoughtsUseCase')

// Controllers
const { ThoughtController } = require('./infrastructure/http/controllers/ThoughtController')
const { HealthController } = require('./infrastructure/http/controllers/HealthController')
const { createThoughtRoutes } = require('./infrastructure/http/routes/thoughtRoutes')

async function startServer() {
    // Connect to MongoDB
    await connect()
    logger.info('MongoDB connected')

    // Create Express app
    const app = express()

    // Middleware
    app.use(helmet())
    app.use(cors({ origin: config.frontendUrl, credentials: true }))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(morgan('combined'))

    // Dependency Injection
    const thoughtRepository = new MongoThoughtRepository(ThoughtModel)

    const createThoughtUseCase = new CreateThoughtUseCase(thoughtRepository)
    const getThoughtUseCase = new GetThoughtUseCase(thoughtRepository)
    const getThoughtsUseCase = new GetThoughtsUseCase(thoughtRepository)
    const updateThoughtUseCase = new UpdateThoughtUseCase(thoughtRepository)
    const deleteThoughtUseCase = new DeleteThoughtUseCase(thoughtRepository)
    const searchThoughtsUseCase = new SearchThoughtsUseCase(thoughtRepository)

    const thoughtController = new ThoughtController({
        createThoughtUseCase,
        getThoughtUseCase,
        getThoughtsUseCase,
        updateThoughtUseCase,
        deleteThoughtUseCase,
        searchThoughtsUseCase
    })

    const healthController = new HealthController()

    // Routes
    app.use('/api/thoughts', createThoughtRoutes(thoughtController, authMiddleware))

    // Health check endpoints for Kubernetes probes
    app.get('/health', healthController.health)
    app.get('/health/liveness', healthController.liveness)
    app.get('/health/readiness', healthController.readiness)
    app.get('/health/startup', healthController.startup)

    // Error handling
    app.use(errorHandler)

    // Start server
    app.listen(config.port, () => {
        logger.info(`Thoughts service running on port ${config.port}`)
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

