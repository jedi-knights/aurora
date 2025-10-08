# Hexagonal Architecture Guide for Aurora Services

## Overview

Each Aurora service follows **Hexagonal Architecture (Ports and Adapters)** pattern with strict adherence to:
- ✅ **DRY** - Don't Repeat Yourself
- ✅ **SOLID** - Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
- ✅ **CLEAN Code** - Meaningful names, small functions, clear intent
- ✅ **Low Complexity** - Cyclomatic complexity ≤ 7

## Hexagonal Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        ADAPTERS (OUTER)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HTTP/REST (Express Controllers & Routes)            │  │
│  │  - Request validation                                │  │
│  │  - Response formatting                               │  │
│  │  - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PORTS (INTERFACES)                      │  │
│  │  - Input Ports (Use Cases)                          │  │
│  │  - Output Ports (Repository Interfaces)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         DOMAIN (CORE - BUSINESS LOGIC)               │  │
│  │  - Entities                                          │  │
│  │  - Value Objects                                     │  │
│  │  - Business Rules                                    │  │
│  │  - Domain Services                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ADAPTERS (OUTER)                        │  │
│  │  - Database Adapters (MongoDB, PostgreSQL)          │  │
│  │  - External Service Adapters                        │  │
│  │  - Message Queue Adapters                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure (Per Service)

```
services/[service-name]/
├── src/
│   ├── domain/              # Core business logic (no dependencies)
│   │   ├── entities/        # Domain entities
│   │   ├── valueObjects/    # Value objects
│   │   ├── repositories/    # Repository interfaces (ports)
│   │   └── services/        # Domain services
│   │
│   ├── application/         # Use cases / Application logic
│   │   ├── useCases/        # Business use cases (input ports)
│   │   ├── dto/             # Data Transfer Objects
│   │   └── mappers/         # Entity <-> DTO mappers
│   │
│   ├── infrastructure/      # External concerns (adapters)
│   │   ├── database/        # DB implementations
│   │   │   ├── mongodb/     # MongoDB adapter
│   │   │   ├── postgresql/  # PostgreSQL adapter
│   │   │   └── repositories/# Concrete repository implementations
│   │   ├── http/            # HTTP adapters
│   │   │   ├── controllers/ # Express controllers
│   │   │   ├── routes/      # Express routes
│   │   │   ├── middlewares/ # Custom middlewares
│   │   │   └── validators/  # Request validators
│   │   └── external/        # External service clients
│   │       └── identity/    # Identity service client
│   │
│   ├── shared/              # Shared utilities
│   │   ├── errors/          # Custom error classes
│   │   ├── validators/      # Validation utilities
│   │   └── logger/          # Logging utility
│   │
│   ├── config/              # Configuration
│   │   └── index.js         # Config loader
│   │
│   └── server.js            # Application entry point
│
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
│
├── package.json
├── .env.example
└── README.md
```

## SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)

**Each class/module has ONE reason to change.**

```javascript
// ❌ BAD - Multiple responsibilities
class ThoughtService {
  async createThought(data) {
    // Validation
    if (!data.text) throw new Error('Invalid')
    
    // Business logic
    const thought = { ...data, timestamp: new Date() }
    
    // Database access
    await db.thoughts.insert(thought)
    
    // External service call
    await searchService.index(thought)
    
    return thought
  }
}

// ✅ GOOD - Single responsibility each
class CreateThoughtUseCase {
  constructor(thoughtRepository, searchService) {
    this.thoughtRepository = thoughtRepository
    this.searchService = searchService
  }

  async execute(dto) {
    const thought = Thought.create(dto) // Domain logic
    await this.thoughtRepository.save(thought)
    await this.searchService.index(thought)
    return thought
  }
}
```

### 2. Open/Closed Principle (OCP)

**Open for extension, closed for modification.**

```javascript
// ✅ GOOD - Use interfaces/abstract classes
class BaseRepository {
  async findById(id) {
    throw new Error('Must implement findById')
  }
}

class MongoThoughtRepository extends BaseRepository {
  async findById(id) {
    return await this.model.findById(id)
  }
}

class PostgresThoughtRepository extends BaseRepository {
  async findById(id) {
    return await this.pool.query('SELECT * FROM thoughts WHERE id = $1', [id])
  }
}
```

### 3. Liskov Substitution Principle (LSP)

**Subtypes must be substitutable for their base types.**

```javascript
// ✅ GOOD - Repositories are interchangeable
class ThoughtService {
  constructor(repository) {
    this.repository = repository // Can be ANY repository implementation
  }

  async getThought(id) {
    return await this.repository.findById(id)
  }
}

// Both work the same way
const mongoService = new ThoughtService(new MongoThoughtRepository())
const pgService = new ThoughtService(new PostgresThoughtRepository())
```

### 4. Interface Segregation Principle (ISP)

**Clients shouldn't depend on interfaces they don't use.**

```javascript
// ❌ BAD - Bloated interface
class IThoughtRepository {
  async findById(id) {}
  async findAll() {}
  async save(thought) {}
  async delete(id) {}
  async search(query) {}
  async export(format) {}
}

// ✅ GOOD - Segregated interfaces
class IThoughtReader {
  async findById(id) {}
  async findAll() {}
}

class IThoughtWriter {
  async save(thought) {}
  async delete(id) {}
}

class IThoughtSearcher {
  async search(query) {}
}
```

### 5. Dependency Inversion Principle (DIP)

**Depend on abstractions, not concretions.**

```javascript
// ❌ BAD - Depends on concrete implementation
class CreateThoughtUseCase {
  constructor() {
    this.repository = new MongoThoughtRepository() // Concrete!
  }
}

// ✅ GOOD - Depends on abstraction
class CreateThoughtUseCase {
  constructor(thoughtRepository) { // Interface/abstraction
    this.repository = thoughtRepository
  }
}

// Dependency injection
const repository = new MongoThoughtRepository()
const useCase = new CreateThoughtUseCase(repository)
```

## DRY Principle Implementation

### Avoid Duplication with Base Classes

```javascript
// ✅ Base controller for common functionality
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

// ✅ Extend for specific controllers
class ThoughtController extends BaseController {
  constructor(createThoughtUseCase) {
    super()
    this.createThoughtUseCase = createThoughtUseCase
  }

  create = this.asyncHandler(async (req, res) => {
    const thought = await this.createThoughtUseCase.execute(req.body)
    return this.handleSuccess(res, thought, 201)
  })
}
```

## Cyclomatic Complexity ≤ 7

### Keep Functions Simple

```javascript
// ❌ BAD - Complexity = 12
function processThought(data) {
  if (!data) return null
  if (!data.text) throw new Error('Missing text')
  if (data.text.length < 1) throw new Error('Too short')
  if (data.text.length > 1000) throw new Error('Too long')
  if (data.tags) {
    if (!Array.isArray(data.tags)) throw new Error('Invalid tags')
    if (data.tags.length > 10) throw new Error('Too many tags')
    for (let tag of data.tags) {
      if (typeof tag !== 'string') throw new Error('Invalid tag')
      if (tag.length > 50) throw new Error('Tag too long')
    }
  }
  return { ...data, timestamp: new Date() }
}

// ✅ GOOD - Complexity = 2 each
class ThoughtValidator {
  static validateText(text) {
    if (!text) throw new ValidationError('Text is required')
    if (text.length < 1) throw new ValidationError('Text too short')
    if (text.length > 1000) throw new ValidationError('Text too long')
  }

  static validateTags(tags) {
    if (!tags) return
    if (!Array.isArray(tags)) throw new ValidationError('Tags must be array')
    if (tags.length > 10) throw new ValidationError('Maximum 10 tags')
    tags.forEach(tag => this.validateTag(tag))
  }

  static validateTag(tag) {
    if (typeof tag !== 'string') throw new ValidationError('Tag must be string')
    if (tag.length > 50) throw new ValidationError('Tag too long')
  }
}

// Simple use case - Complexity = 1
class CreateThoughtUseCase {
  async execute(dto) {
    ThoughtValidator.validateText(dto.text)
    ThoughtValidator.validateTags(dto.tags)
    
    const thought = Thought.create(dto)
    return await this.repository.save(thought)
  }
}
```

## CLEAN Code Principles

### 1. Meaningful Names

```javascript
// ❌ BAD
const t = await repo.get(i)
const d = new Date()
function proc(x) { ... }

// ✅ GOOD
const thought = await thoughtRepository.findById(thoughtId)
const createdAt = new Date()
function createThought(thoughtData) { ... }
```

### 2. Small Functions (< 20 lines)

```javascript
// ✅ Each function does ONE thing
class ThoughtMapper {
  static toDTO(entity) {
    return {
      id: entity.id,
      text: entity.text,
      timestamp: entity.timestamp.toISOString(),
      tags: entity.tags
    }
  }

  static toDomain(dto) {
    return new Thought({
      id: dto.id,
      text: dto.text,
      timestamp: new Date(dto.timestamp),
      tags: dto.tags || []
    })
  }
}
```

### 3. Comments Only When Necessary

```javascript
// ❌ BAD - Redundant comment
// Get thought by id
async getThought(id) { ... }

// ✅ GOOD - Code is self-explanatory
async findThoughtById(id) { ... }

// ✅ GOOD - Comment explains WHY
async deleteThought(id) {
  // Soft delete to maintain audit trail
  return await this.repository.markAsDeleted(id)
}
```

### 4. Error Handling

```javascript
// ✅ Custom error classes
class DomainError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

class NotFoundError extends DomainError {
  constructor(entity, id) {
    super(`${entity} with id ${id} not found`)
    this.statusCode = 404
  }
}

class ValidationError extends DomainError {
  constructor(message) {
    super(message)
    this.statusCode = 400
  }
}

// ✅ Centralized error handling
class ErrorHandler {
  static handle(error, req, res, next) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'
    
    logger.error({
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    })
    
    res.status(statusCode).json({
      success: false,
      error: message
    })
  }
}
```

## Example: Complete Use Case

```javascript
// domain/entities/Thought.js
class Thought {
  constructor({ id, userId, text, timestamp, tags }) {
    this.id = id
    this.userId = userId
    this.text = text
    this.timestamp = timestamp
    this.tags = tags || []
  }

  static create(data) {
    if (!data.text) {
      throw new ValidationError('Text is required')
    }
    
    return new Thought({
      id: generateId(),
      userId: data.userId,
      text: data.text,
      timestamp: new Date(),
      tags: data.tags || []
    })
  }

  addTag(tag) {
    if (this.tags.includes(tag)) return
    this.tags.push(tag)
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag)
  }
}

// domain/repositories/IThoughtRepository.js
class IThoughtRepository {
  async save(thought) {
    throw new Error('Must implement save')
  }

  async findById(id) {
    throw new Error('Must implement findById')
  }

  async findByUserId(userId) {
    throw new Error('Must implement findByUserId')
  }

  async delete(id) {
    throw new Error('Must implement delete')
  }
}

// application/useCases/CreateThoughtUseCase.js
class CreateThoughtUseCase {
  constructor(thoughtRepository) {
    this.thoughtRepository = thoughtRepository
  }

  async execute(dto) {
    // Domain logic
    const thought = Thought.create(dto)
    
    // Persistence
    const savedThought = await this.thoughtRepository.save(thought)
    
    return savedThought
  }
}

// infrastructure/database/mongodb/MongoThoughtRepository.js
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
      tags: thought.tags
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

  toDomain(doc) {
    return new Thought({
      id: doc._id.toString(),
      userId: doc.userId,
      text: doc.text,
      timestamp: doc.timestamp,
      tags: doc.tags
    })
  }
}

// infrastructure/http/controllers/ThoughtController.js
class ThoughtController extends BaseController {
  constructor(createThoughtUseCase, getThoughtsUseCase) {
    super()
    this.createThoughtUseCase = createThoughtUseCase
    this.getThoughtsUseCase = getThoughtsUseCase
  }

  create = this.asyncHandler(async (req, res) => {
    const dto = {
      userId: req.user.id,
      text: req.body.text,
      tags: req.body.tags
    }
    
    const thought = await this.createThoughtUseCase.execute(dto)
    return this.handleSuccess(res, thought, 201)
  })

  getAll = this.asyncHandler(async (req, res) => {
    const thoughts = await this.getThoughtsUseCase.execute(req.user.id)
    return this.handleSuccess(res, thoughts)
  })
}

// server.js - Dependency Injection
const thoughtModel = mongoose.model('Thought', thoughtSchema)
const thoughtRepository = new MongoThoughtRepository(thoughtModel)
const createThoughtUseCase = new CreateThoughtUseCase(thoughtRepository)
const getThoughtsUseCase = new GetThoughtsUseCase(thoughtRepository)
const thoughtController = new ThoughtController(
  createThoughtUseCase,
  getThoughtsUseCase
)

app.post('/api/thoughts', 
  authMiddleware, 
  thoughtController.create
)
```

## Testing Strategy

### Unit Tests (Domain & Application Layer)
```javascript
describe('CreateThoughtUseCase', () => {
  it('should create thought with valid data', async () => {
    // Arrange
    const mockRepo = {
      save: jest.fn().mockResolvedValue(expectedThought)
    }
    const useCase = new CreateThoughtUseCase(mockRepo)
    
    // Act
    const result = await useCase.execute({
      userId: 'user-1',
      text: 'Test thought'
    })
    
    // Assert
    expect(result).toEqual(expectedThought)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests (Infrastructure Layer)
```javascript
describe('MongoThoughtRepository', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })
  
  it('should save and retrieve thought', async () => {
    const repo = new MongoThoughtRepository(ThoughtModel)
    const thought = Thought.create({ 
      userId: 'user-1', 
      text: 'Test' 
    })
    
    await repo.save(thought)
    const retrieved = await repo.findById(thought.id)
    
    expect(retrieved.text).toBe('Test')
  })
})
```

## Benefits of This Architecture

1. ✅ **Testability** - Business logic separate from frameworks
2. ✅ **Flexibility** - Easy to swap databases or frameworks
3. ✅ **Maintainability** - Clear separation of concerns
4. ✅ **Scalability** - Each layer scales independently
5. ✅ **Team Collaboration** - Clear boundaries between components
6. ✅ **Low Coupling** - Dependencies point inward
7. ✅ **High Cohesion** - Related code stays together

## Next Steps

See service-specific implementation guides:
- [Identity Service Structure](./services/identity/STRUCTURE.md)
- [Thoughts Service Structure](./services/thoughts/STRUCTURE.md)
- [Journals Service Structure](./services/journals/STRUCTURE.md)
- [Planning Service Structure](./services/planning/STRUCTURE.md)

