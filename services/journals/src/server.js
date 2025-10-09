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
const { JournalModel } = require('./infrastructure/database/mongodb/models/JournalModel')
const { EntryModel } = require('./infrastructure/database/mongodb/models/EntryModel')

// Repositories
const { MongoJournalRepository } = require('./infrastructure/database/mongodb/repositories/MongoJournalRepository')
const { MongoEntryRepository } = require('./infrastructure/database/mongodb/repositories/MongoEntryRepository')

// Journal Use Cases
const { CreateJournalUseCase } = require('./application/useCases/CreateJournalUseCase')
const { GetJournalUseCase } = require('./application/useCases/GetJournalUseCase')
const { GetJournalsUseCase } = require('./application/useCases/GetJournalsUseCase')
const { UpdateJournalUseCase } = require('./application/useCases/UpdateJournalUseCase')
const { DeleteJournalUseCase } = require('./application/useCases/DeleteJournalUseCase')

// Entry Use Cases
const { CreateEntryUseCase } = require('./application/useCases/CreateEntryUseCase')
const { GetEntryUseCase } = require('./application/useCases/GetEntryUseCase')
const { GetEntriesUseCase } = require('./application/useCases/GetEntriesUseCase')
const { UpdateEntryUseCase } = require('./application/useCases/UpdateEntryUseCase')
const { DeleteEntryUseCase } = require('./application/useCases/DeleteEntryUseCase')

// Controllers
const { JournalController } = require('./infrastructure/http/controllers/JournalController')
const { EntryController } = require('./infrastructure/http/controllers/EntryController')
const { HealthController } = require('./infrastructure/http/controllers/HealthController')
const { createJournalRoutes } = require('./infrastructure/http/routes/journalRoutes')
const { createEntryRoutes } = require('./infrastructure/http/routes/entryRoutes')

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
    const journalRepository = new MongoJournalRepository(JournalModel, EntryModel)
    const entryRepository = new MongoEntryRepository(EntryModel)

    // Journal Use Cases
    const createJournalUseCase = new CreateJournalUseCase(journalRepository)
    const getJournalUseCase = new GetJournalUseCase(journalRepository)
    const getJournalsUseCase = new GetJournalsUseCase(journalRepository)
    const updateJournalUseCase = new UpdateJournalUseCase(journalRepository)
    const deleteJournalUseCase = new DeleteJournalUseCase(journalRepository)

    // Entry Use Cases
    const createEntryUseCase = new CreateEntryUseCase(journalRepository, entryRepository)
    const getEntryUseCase = new GetEntryUseCase(journalRepository, entryRepository)
    const getEntriesUseCase = new GetEntriesUseCase(journalRepository, entryRepository)
    const updateEntryUseCase = new UpdateEntryUseCase(journalRepository, entryRepository)
    const deleteEntryUseCase = new DeleteEntryUseCase(journalRepository, entryRepository)

    // Controllers
    const journalController = new JournalController({
        createJournalUseCase,
        getJournalsUseCase,
        getJournalUseCase,
        updateJournalUseCase,
        deleteJournalUseCase
    })

    const entryController = new EntryController({
        createEntryUseCase,
        getEntriesUseCase,
        getEntryUseCase,
        updateEntryUseCase,
        deleteEntryUseCase
    })

    const healthController = new HealthController()

    // Routes
    app.use('/api/journals', createJournalRoutes(journalController, authMiddleware))
    app.use('/api/journals/:journalId/entries', createEntryRoutes(entryController, authMiddleware))

    // Health check endpoints for Kubernetes probes
    app.get('/health', healthController.health)
    app.get('/health/liveness', healthController.liveness)
    app.get('/health/readiness', healthController.readiness)
    app.get('/health/startup', healthController.startup)

    // Error handling
    app.use(errorHandler)

    // Start server
    app.listen(config.port, () => {
        logger.info(`Journals service running on port ${config.port}`)
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

