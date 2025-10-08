# Thoughts Service - Hexagonal Architecture Structure

## Complete Directory Structure

```
services/thoughts/
├── src/
│   ├── domain/                          # Core business logic (no dependencies)
│   │   ├── entities/
│   │   │   └── Thought.js              # Thought entity
│   │   ├── valueObjects/
│   │   │   └── Tag.js                  # Tag value object
│   │   ├── repositories/
│   │   │   └── IThoughtRepository.js   # Repository interface
│   │   └── services/
│   │       └── ThoughtDomainService.js # Domain business rules
│   │
│   ├── application/                     # Use cases
│   │   ├── useCases/
│   │   │   ├── CreateThoughtUseCase.js
│   │   │   ├── GetThoughtUseCase.js
│   │   │   ├── GetThoughtsUseCase.js
│   │   │   ├── UpdateThoughtUseCase.js
│   │   │   ├── DeleteThoughtUseCase.js
│   │   │   ├── AddTagUseCase.js
│   │   │   └── SearchThoughtsUseCase.js
│   │   ├── dto/
│   │   │   ├── CreateThoughtDTO.js
│   │   │   └── ThoughtDTO.js
│   │   └── mappers/
│   │       └── ThoughtMapper.js
│   │
│   ├── infrastructure/                  # External concerns
│   │   ├── database/
│   │   │   ├── mongodb/
│   │   │   │   ├── connection.js       # MongoDB connection
│   │   │   │   ├── models/
│   │   │   │   │   └── ThoughtModel.js # Mongoose model
│   │   │   │   └── repositories/
│   │   │   │       └── MongoThoughtRepository.js
│   │   │   └── seed/
│   │   │       └── seedData.js
│   │   │
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   └── ThoughtController.js
│   │   │   ├── routes/
│   │   │   │   └── thoughtRoutes.js
│   │   │   ├── middlewares/
│   │   │   │   ├── authMiddleware.js
│   │   │   │   └── errorMiddleware.js
│   │   │   └── validators/
│   │   │       └── thoughtValidator.js
│   │   │
│   │   └── external/
│   │       └── identityService/
│   │           └── IdentityServiceClient.js
│   │
│   ├── shared/                          # Shared utilities
│   │   ├── errors/
│   │   │   ├── DomainError.js
│   │   │   ├── NotFoundError.js
│   │   │   └── ValidationError.js
│   │   ├── validators/
│   │   │   └── BaseValidator.js
│   │   └── logger/
│   │       └── logger.js
│   │
│   ├── config/
│   │   └── index.js                    # Configuration loader
│   │
│   └── server.js                        # Application entry point
│
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   │   └── entities/
│   │   │       └── Thought.test.js
│   │   └── application/
│   │       └── useCases/
│   │           └── CreateThoughtUseCase.test.js
│   ├── integration/
│   │   └── repositories/
│   │       └── MongoThoughtRepository.test.js
│   └── fixtures/
│       └── thoughts.js
│
├── package.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Example Implementation Files

### 1. Domain Layer

#### src/domain/entities/Thought.js
```javascript
const { ValidationError } = require('../../shared/errors/ValidationError')
const { generateId } = require('../../shared/utils/idGenerator')

class Thought {
  constructor({ id, userId, text, timestamp, tags, createdAt, updatedAt }) {
    this.id = id
    this.userId = userId
    this.text = text
    this.timestamp = timestamp
    this.tags = tags || []
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static create({ userId, text, tags = [] }) {
    this.validateText(text)
    this.validateTags(tags)

    return new Thought({
      id: generateId(),
      userId,
      text,
      timestamp: new Date(),
      tags: this.normalizeTags(tags),
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  update({ text, tags }) {
    if (text !== undefined) {
      this.validateText(text)
      this.text = text
    }

    if (tags !== undefined) {
      this.validateTags(tags)
      this.tags = this.constructor.normalizeTags(tags)
    }

    this.updatedAt = new Date()
  }

  addTag(tag) {
    const normalizedTag = tag.toLowerCase().trim()
    if (!this.tags.includes(normalizedTag)) {
      this.tags.push(normalizedTag)
      this.updatedAt = new Date()
    }
  }

  removeTag(tag) {
    const normalizedTag = tag.toLowerCase().trim()
    this.tags = this.tags.filter(t => t !== normalizedTag)
    this.updatedAt = new Date()
  }

  static validateText(text) {
    if (!text || typeof text !== 'string') {
      throw new ValidationError('Text must be a non-empty string')
    }

    if (text.trim().length === 0) {
      throw new ValidationError('Text cannot be empty')
    }

    if (text.length > 10000) {
      throw new ValidationError('Text cannot exceed 10000 characters')
    }
  }

  static validateTags(tags) {
    if (!Array.isArray(tags)) {
      throw new ValidationError('Tags must be an array')
    }

    if (tags.length > 20) {
      throw new ValidationError('Cannot have more than 20 tags')
    }

    tags.forEach(tag => {
      if (typeof tag !== 'string') {
        throw new ValidationError('Each tag must be a string')
      }
      if (tag.length > 50) {
        throw new ValidationError('Tag cannot exceed 50 characters')
      }
    })
  }

  static normalizeTags(tags) {
    return [...new Set(tags.map(tag => tag.toLowerCase().trim()))]
  }
}

module.exports = { Thought }
```

#### src/domain/repositories/IThoughtRepository.js
```javascript
class IThoughtRepository {
  async save(thought) {
    throw new Error('save method must be implemented')
  }

  async findById(id) {
    throw new Error('findById method must be implemented')
  }

  async findByUserId(userId, options = {}) {
    throw new Error('findByUserId method must be implemented')
  }

  async findByTag(userId, tag) {
    throw new Error('findByTag method must be implemented')
  }

  async search(userId, query) {
    throw new Error('search method must be implemented')
  }

  async delete(id) {
    throw new Error('delete method must be implemented')
  }

  async getUserTags(userId) {
    throw new Error('getUserTags method must be implemented')
  }
}

module.exports = { IThoughtRepository }
```

### 2. Application Layer

#### src/application/useCases/CreateThoughtUseCase.js
```javascript
const { Thought } = require('../../domain/entities/Thought')
const { ThoughtDTO } = require('../dto/ThoughtDTO')

class CreateThoughtUseCase {
  constructor(thoughtRepository) {
    this.thoughtRepository = thoughtRepository
  }

  async execute({ userId, text, tags }) {
    // Create domain entity
    const thought = Thought.create({ userId, text, tags })

    // Persist
    const savedThought = await this.thoughtRepository.save(thought)

    // Return DTO
    return ThoughtDTO.fromEntity(savedThought)
  }
}

module.exports = { CreateThoughtUseCase }
```

#### src/application/useCases/GetThoughtsUseCase.js
```javascript
const { ThoughtDTO } = require('../dto/ThoughtDTO')

class GetThoughtsUseCase {
  constructor(thoughtRepository) {
    this.thoughtRepository = thoughtRepository
  }

  async execute(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      tag = null,
      sortBy = 'timestamp',
      order = 'desc'
    } = options

    let thoughts

    if (tag) {
      thoughts = await this.thoughtRepository.findByTag(userId, tag)
    } else {
      thoughts = await this.thoughtRepository.findByUserId(userId, {
        limit,
        offset,
        sortBy,
        order
      })
    }

    return thoughts.map(thought => ThoughtDTO.fromEntity(thought))
  }
}

module.exports = { GetThoughtsUseCase }
```

#### src/application/dto/ThoughtDTO.js
```javascript
class ThoughtDTO {
  constructor({ id, userId, text, timestamp, tags, createdAt, updatedAt }) {
    this.id = id
    this.userId = userId
    this.text = text
    this.timestamp = timestamp
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static fromEntity(thought) {
    return new ThoughtDTO({
      id: thought.id,
      userId: thought.userId,
      text: thought.text,
      timestamp: thought.timestamp.toISOString(),
      tags: thought.tags,
      createdAt: thought.createdAt.toISOString(),
      updatedAt: thought.updatedAt.toISOString()
    })
  }
}

module.exports = { ThoughtDTO }
```

### 3. Infrastructure Layer

#### src/infrastructure/database/mongodb/repositories/MongoThoughtRepository.js
```javascript
const { IThoughtRepository } = require('../../../../domain/repositories/IThoughtRepository')
const { Thought } = require('../../../../domain/entities/Thought')
const { NotFoundError } = require('../../../../shared/errors/NotFoundError')

class MongoThoughtRepository extends IThoughtRepository {
  constructor(model) {
    super()
    this.model = model
  }

  async save(thought) {
    const doc = await this.model.create({
      _id: thought.id,
      userId: thought.userId,
      text: thought.text,
      timestamp: thought.timestamp,
      tags: thought.tags,
      createdAt: thought.createdAt,
      updatedAt: thought.updatedAt
    })

    return this.toDomain(doc)
  }

  async findById(id) {
    const doc = await this.model.findById(id)
    
    if (!doc) {
      throw new NotFoundError('Thought', id)
    }

    return this.toDomain(doc)
  }

  async findByUserId(userId, options = {}) {
    const { limit = 50, offset = 0, sortBy = 'timestamp', order = 'desc' } = options

    const docs = await this.model
      .find({ userId })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit)
      .skip(offset)
      .lean()

    return docs.map(doc => this.toDomain(doc))
  }

  async findByTag(userId, tag) {
    const docs = await this.model
      .find({ userId, tags: tag.toLowerCase() })
      .sort({ timestamp: -1 })
      .lean()

    return docs.map(doc => this.toDomain(doc))
  }

  async search(userId, query) {
    const docs = await this.model
      .find({
        userId,
        $text: { $search: query }
      })
      .sort({ score: { $meta: 'textScore' } })
      .lean()

    return docs.map(doc => this.toDomain(doc))
  }

  async delete(id) {
    const result = await this.model.findByIdAndDelete(id)
    
    if (!result) {
      throw new NotFoundError('Thought', id)
    }

    return true
  }

  async getUserTags(userId) {
    const result = await this.model.aggregate([
      { $match: { userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    return result.map(item => ({
      tag: item._id,
      count: item.count
    }))
  }

  toDomain(doc) {
    return new Thought({
      id: doc._id.toString(),
      userId: doc.userId,
      text: doc.text,
      timestamp: doc.timestamp,
      tags: doc.tags,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    })
  }
}

module.exports = { MongoThoughtRepository }
```

#### src/infrastructure/http/controllers/ThoughtController.js
```javascript
const { BaseController } = require('./BaseController')

class ThoughtController extends BaseController {
  constructor({
    createThoughtUseCase,
    getThoughtUseCase,
    getThoughtsUseCase,
    updateThoughtUseCase,
    deleteThoughtUseCase,
    addTagUseCase,
    searchThoughtsUseCase
  }) {
    super()
    this.createThoughtUseCase = createThoughtUseCase
    this.getThoughtUseCase = getThoughtUseCase
    this.getThoughtsUseCase = getThoughtsUseCase
    this.updateThoughtUseCase = updateThoughtUseCase
    this.deleteThoughtUseCase = deleteThoughtUseCase
    this.addTagUseCase = addTagUseCase
    this.searchThoughtsUseCase = searchThoughtsUseCase
  }

  create = this.asyncHandler(async (req, res) => {
    const thought = await this.createThoughtUseCase.execute({
      userId: req.user.id,
      text: req.body.text,
      tags: req.body.tags
    })

    return this.handleSuccess(res, thought, 201)
  })

  getAll = this.asyncHandler(async (req, res) => {
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      tag: req.query.tag,
      sortBy: req.query.sortBy || 'timestamp',
      order: req.query.order || 'desc'
    }

    const thoughts = await this.getThoughtsUseCase.execute(req.user.id, options)

    return this.handleSuccess(res, thoughts)
  })

  getOne = this.asyncHandler(async (req, res) => {
    const thought = await this.getThoughtUseCase.execute(req.params.id, req.user.id)

    return this.handleSuccess(res, thought)
  })

  update = this.asyncHandler(async (req, res) => {
    const thought = await this.updateThoughtUseCase.execute({
      id: req.params.id,
      userId: req.user.id,
      text: req.body.text,
      tags: req.body.tags
    })

    return this.handleSuccess(res, thought)
  })

  delete = this.asyncHandler(async (req, res) => {
    await this.deleteThoughtUseCase.execute(req.params.id, req.user.id)

    return this.handleSuccess(res, { message: 'Thought deleted successfully' })
  })

  search = this.asyncHandler(async (req, res) => {
    const thoughts = await this.searchThoughtsUseCase.execute(
      req.user.id,
      req.query.q
    )

    return this.handleSuccess(res, thoughts)
  })
}

module.exports = { ThoughtController }
```

#### src/infrastructure/http/controllers/BaseController.js
```javascript
class BaseController {
  handleSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data
    })
  }

  handleError(res, error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      success: false,
      error: error.message
    })
  }

  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}

module.exports = { BaseController }
```

### 4. Dependency Injection (server.js)

#### src/server.js
```javascript
const express = require('express')
const mongoose = require('mongoose')
const config = require('./config')
const { logger } = require('./shared/logger/logger')
const { errorHandler } = require('./infrastructure/http/middlewares/errorMiddleware')

// Infrastructure
const { ThoughtModel } = require('./infrastructure/database/mongodb/models/ThoughtModel')
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
const { thoughtRoutes } = require('./infrastructure/http/routes/thoughtRoutes')

async function startServer() {
  // Connect to MongoDB
  await mongoose.connect(config.mongodbUri)
  logger.info('Connected to MongoDB')

  // Create app
  const app = express()
  
  // Middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

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

  // Routes
  app.use('/api/thoughts', thoughtRoutes(thoughtController))

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      service: 'thoughts',
      timestamp: new Date().toISOString()
    })
  })

  // Error handling
  app.use(errorHandler)

  // Start server
  app.listen(config.port, () => {
    logger.info(`Thoughts service running on port ${config.port}`)
  })
}

startServer().catch(err => {
  logger.error('Failed to start server:', err)
  process.exit(1)
})
```

## Benefits of This Structure

1. ✅ **Testability** - Each layer can be tested independently
2. ✅ **Maintainability** - Clear separation of concerns
3. ✅ **Flexibility** - Easy to swap implementations (MongoDB → PostgreSQL)
4. ✅ **SOLID Principles** - Each class has single responsibility
5. ✅ **DRY** - No code duplication
6. ✅ **Low Complexity** - Functions are small and focused
7. ✅ **Clean Code** - Self-documenting, meaningful names

## Next Steps

1. Copy this structure to `services/thoughts/`
2. Install dependencies: `npm install`
3. Implement missing use cases
4. Add validators
5. Add tests
6. Run and test!

