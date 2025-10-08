const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const config = require('./config')
const { logger } = require('./shared/logger/logger')
const { connect } = require('./infrastructure/database/postgresql/connection')
const { errorHandler } = require('./infrastructure/http/middlewares/errorHandler')
const { authMiddleware } = require('./infrastructure/http/middlewares/authMiddleware')

// Repositories
const { PostgresTaskRepository } = require('./infrastructure/database/postgresql/repositories/PostgresTaskRepository')

// Use Cases
const { CreateTaskUseCase } = require('./application/useCases/CreateTaskUseCase')
const { GetTaskUseCase } = require('./application/useCases/GetTaskUseCase')
const { GetTasksUseCase } = require('./application/useCases/GetTasksUseCase')
const { UpdateTaskUseCase } = require('./application/useCases/UpdateTaskUseCase')
const { DeleteTaskUseCase } = require('./application/useCases/DeleteTaskUseCase')
const { CompleteTaskUseCase } = require('./application/useCases/CompleteTaskUseCase')
const { GetCalendarUseCase } = require('./application/useCases/GetCalendarUseCase')

// Controllers
const { TaskController } = require('./infrastructure/http/controllers/TaskController')
const { createTaskRoutes } = require('./infrastructure/http/routes/taskRoutes')

async function startServer() {
  // Connect to PostgreSQL
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
  const taskRepository = new PostgresTaskRepository(pool)
  
  const createTaskUseCase = new CreateTaskUseCase(taskRepository)
  const getTaskUseCase = new GetTaskUseCase(taskRepository)
  const getTasksUseCase = new GetTasksUseCase(taskRepository)
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository)
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository)
  const completeTaskUseCase = new CompleteTaskUseCase(taskRepository)
  const getCalendarUseCase = new GetCalendarUseCase(taskRepository)

  const taskController = new TaskController({
    createTaskUseCase,
    getTaskUseCase,
    getTasksUseCase,
    updateTaskUseCase,
    deleteTaskUseCase,
    completeTaskUseCase,
    getCalendarUseCase
  })

  // Routes
  app.use('/api/tasks', createTaskRoutes(taskController, authMiddleware))

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'planning',
      timestamp: new Date().toISOString()
    })
  })

  // Error handling
  app.use(errorHandler)

  // Start server
  app.listen(config.port, () => {
    logger.info(`Planning service running on port ${config.port}`)
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

