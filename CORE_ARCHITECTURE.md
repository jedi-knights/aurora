# Aurora - Core Microservices Architecture

## Overview

A practical microservices architecture with 4 core domain services, each with its own optimized database.

## Service Architecture

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
│   Port 3000 │
└──────┬──────┘
       │
┌──────▼──────────┐
│  API Gateway    │  Optional but recommended
│   Port 4000     │
└──────┬──────────┘
       │
   ┌───┼────────────┬────────────┐
   │   │            │            │
┌──▼───▼──┐  ┌─────▼─────┐  ┌───▼──────┐  ┌────▼─────┐
│Identity │  │ Thoughts  │  │ Journals │  │ Planning │
│ (5000)  │  │  (4001)   │  │  (4002)  │  │  (4003)  │
│         │  │           │  │          │  │          │
│PostgreSQL│ │  MongoDB  │  │ MongoDB  │  │PostgreSQL│
└─────────┘  └───────────┘  └──────────┘  └──────────┘
```

## Services & Database Choices

### 1. Identity Service (Port 5000)
**Database: PostgreSQL**

**Why PostgreSQL:**
- ✅ User data requires ACID transactions
- ✅ Relational structure (users → roles → permissions)
- ✅ Strong consistency for auth is critical
- ✅ Complex queries for authorization checks

**Responsibilities:**
- User registration/login
- JWT token generation
- Password management
- Session management
- OAuth integration

**Data:**
```sql
-- PostgreSQL Schema
users (id, email, password_hash, name, created_at)
roles (id, name, description)
user_roles (user_id, role_id)
refresh_tokens (token, user_id, expires_at)
```

---

### 2. Thoughts Service (Port 4001)
**Database: MongoDB**

**Why MongoDB:**
- ✅ Simple document structure - each thought is independent
- ✅ High write volume expected (quick capture use case)
- ✅ No complex joins needed
- ✅ Flexible schema for future metadata (tags, attachments)
- ✅ Fast writes, simple reads

**Responsibilities:**
- Create/read/update/delete thoughts
- Tag management
- Search within user's thoughts

**Data:**
```javascript
// MongoDB Collection: thoughts
{
  _id: ObjectId,
  userId: String,
  text: String,
  timestamp: Date,
  tags: [String],
  metadata: {
    wordCount: Number,
    hasAttachment: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1, timestamp: -1 }  // User's thoughts by date
{ userId: 1, tags: 1 }         // Filter by tags
{ text: "text" }               // Full-text search
```

---

### 3. Journals Service (Port 4002)
**Database: MongoDB**

**Why MongoDB:**
- ✅ Hierarchical structure (journal → entries)
- ✅ Entries can have varying metadata (mood, weather, location)
- ✅ Document model fits naturally (journal with embedded/referenced entries)
- ✅ Flexible schema for different journal types
- ✅ No complex cross-journal queries needed

**Responsibilities:**
- Create/manage journals
- Create/manage entries
- Journal sharing
- Export journals

**Data:**
```javascript
// MongoDB Collection: journals
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  icon: String,
  settings: {
    isPrivate: Boolean,
    defaultMood: String
  },
  createdAt: Date,
  updatedAt: Date
}

// MongoDB Collection: journal_entries
{
  _id: ObjectId,
  journalId: String,
  content: String,
  timestamp: Date,
  metadata: {
    mood: String,
    weather: String,
    location: String,
    wordCount: Number
  },
  version: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ userId: 1 }
{ journalId: 1, timestamp: -1 }
{ journalId: 1, "metadata.mood": 1 }
```

---

### 4. Planning Service (Port 4003)
**Database: PostgreSQL**

**Why PostgreSQL:**
- ✅ Date-based queries are PostgreSQL's strength
- ✅ Complex calendar queries (date ranges, recurring events)
- ✅ ACID transactions for task completion state
- ✅ Relationships between tasks and categories
- ✅ Need for aggregations (completion rates, statistics)

**Responsibilities:**
- Create/manage tasks and events
- Calendar views (day/week/month)
- Task completion tracking
- Recurring tasks
- Task categorization

**Data:**
```sql
-- PostgreSQL Schema
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    due_time TIME,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    category VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_categories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50)
);

-- Indexes for date-based queries
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX idx_tasks_completed ON tasks(user_id, completed, date);
```

---

## 5. API Gateway (Port 4000) - Optional but Recommended

**Purpose:**
- Single entry point for frontend
- Authentication middleware
- Request routing
- Rate limiting

**Simple Express Implementation:**
```javascript
// Route configuration
const routes = {
  '/auth/*': 'http://identity:5000',
  '/api/thoughts/*': 'http://thoughts:4001',
  '/api/journals/*': 'http://journals:4002',
  '/api/planning/*': 'http://planning:4003'
}
```

---

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000

  # API Gateway
  gateway:
    build: ./services/gateway
    ports:
      - "4000:4000"
    environment:
      - IDENTITY_URL=http://identity:5000
      - THOUGHTS_URL=http://thoughts:4001
      - JOURNALS_URL=http://journals:4002
      - PLANNING_URL=http://planning:4003
      - JWT_SECRET=${JWT_SECRET}

  # Identity Service (PostgreSQL)
  identity:
    build: ./services/identity
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://aurora:${POSTGRES_PASSWORD}@postgres-identity:5432/aurora_identity
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres-identity

  postgres-identity:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=aurora_identity
      - POSTGRES_USER=aurora
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-identity-data:/var/lib/postgresql/data

  # Thoughts Service (MongoDB)
  thoughts:
    build: ./services/thoughts
    ports:
      - "4001:4001"
    environment:
      - MONGODB_URI=mongodb://mongo-thoughts:27017/aurora_thoughts
      - IDENTITY_URL=http://identity:5000
    depends_on:
      - mongo-thoughts

  mongo-thoughts:
    image: mongo:7-jammy
    environment:
      - MONGO_INITDB_DATABASE=aurora_thoughts
    volumes:
      - mongo-thoughts-data:/data/db

  # Journals Service (MongoDB)
  journals:
    build: ./services/journals
    ports:
      - "4002:4002"
    environment:
      - MONGODB_URI=mongodb://mongo-journals:27017/aurora_journals
      - IDENTITY_URL=http://identity:5000
    depends_on:
      - mongo-journals

  mongo-journals:
    image: mongo:7-jammy
    environment:
      - MONGO_INITDB_DATABASE=aurora_journals
    volumes:
      - mongo-journals-data:/data/db

  # Planning Service (PostgreSQL)
  planning:
    build: ./services/planning
    ports:
      - "4003:4003"
    environment:
      - DATABASE_URL=postgresql://aurora:${POSTGRES_PASSWORD}@postgres-planning:5432/aurora_planning
      - IDENTITY_URL=http://identity:5000
    depends_on:
      - postgres-planning

  postgres-planning:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=aurora_planning
      - POSTGRES_USER=aurora
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-planning-data:/var/lib/postgresql/data

  # Redis (shared - sessions, caching)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-identity-data:
  postgres-planning-data:
  mongo-thoughts-data:
  mongo-journals-data:
  redis-data:

networks:
  default:
    name: aurora-network
```

---

## Database Choice Rationale Summary

| Service | Database | Reason |
|---------|----------|--------|
| **Identity** | PostgreSQL | ACID transactions, relations, strong consistency |
| **Thoughts** | MongoDB | High write volume, simple documents, no joins |
| **Journals** | MongoDB | Hierarchical data, flexible schema, document-oriented |
| **Planning** | PostgreSQL | Date queries, aggregations, ACID for state |

---

## Inter-Service Communication

### Authentication Flow
```
1. User logs in → Identity Service
2. Identity returns JWT token
3. Frontend includes token in all requests
4. API Gateway validates token with Identity Service
5. Gateway routes to appropriate service
6. Services trust validated requests from Gateway
```

### Service-to-Service Auth
- Services don't call each other directly
- All requests go through API Gateway
- Gateway adds `X-User-Id` header after auth validation
- Services trust the Gateway

---

## API Endpoints

### Identity Service (5000)
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
PUT    /auth/me
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/oauth/:provider
GET    /auth/oauth/:provider/callback
```

### Thoughts Service (4001)
```
GET    /api/thoughts
POST   /api/thoughts
GET    /api/thoughts/:id
PUT    /api/thoughts/:id
DELETE /api/thoughts/:id
GET    /api/thoughts/search?q=query
GET    /api/thoughts/tags
POST   /api/thoughts/:id/tags
DELETE /api/thoughts/:id/tags/:tag
```

### Journals Service (4002)
```
GET    /api/journals
POST   /api/journals
GET    /api/journals/:id
PUT    /api/journals/:id
DELETE /api/journals/:id
GET    /api/journals/:id/entries
POST   /api/journals/:id/entries
GET    /api/journals/:id/entries/:entryId
PUT    /api/journals/:id/entries/:entryId
DELETE /api/journals/:id/entries/:entryId
GET    /api/journals/:id/export?format=pdf|markdown
```

### Planning Service (4003)
```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/complete
GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/calendar?start=date&end=date&view=day|week|month
```

---

## Tech Stack Per Service

### Identity Service
- **Language:** Node.js with TypeScript
- **Framework:** Express or NestJS
- **Database:** PostgreSQL + pg or Prisma
- **Auth:** bcrypt, jsonwebtoken, passport.js
- **Validation:** Zod

### Thoughts Service
- **Language:** Node.js with TypeScript
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Search:** MongoDB text search (built-in)
- **Validation:** Zod

### Journals Service
- **Language:** Node.js with TypeScript
- **Framework:** Express
- **Database:** MongoDB + Mongoose
- **Export:** PDFKit or Puppeteer
- **Validation:** Zod

### Planning Service
- **Language:** Node.js with TypeScript
- **Framework:** Express
- **Database:** PostgreSQL + pg or Prisma
- **Date handling:** date-fns or Luxon
- **Validation:** Zod

### API Gateway
- **Language:** Node.js with TypeScript
- **Framework:** Express or Fastify
- **Proxy:** http-proxy-middleware
- **Cache:** Redis
- **Rate Limiting:** express-rate-limit with Redis store

---

## Environment Variables

### .env File
```env
# Postgres
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Service URLs (for gateway)
IDENTITY_URL=http://identity:5000
THOUGHTS_URL=http://thoughts:4001
JOURNALS_URL=http://journals:4002
PLANNING_URL=http://planning:4003

# Node
NODE_ENV=development
```

---

## Development Workflow

### Start All Services
```bash
docker-compose up -d
```

### Develop Locally
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Identity
cd services/identity && npm run dev

# Terminal 3 - Thoughts
cd services/thoughts && npm run dev

# Terminal 4 - Journals
cd services/journals && npm run dev

# Terminal 5 - Planning
cd services/planning && npm run dev
```

### Access Services
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- Identity: http://localhost:5000
- Thoughts: http://localhost:4001
- Journals: http://localhost:4002
- Planning: http://localhost:4003

---

## Backup Strategy

### PostgreSQL Databases
```bash
# Identity DB
pg_dump -h localhost -U aurora aurora_identity > identity_backup.sql

# Planning DB
pg_dump -h localhost -U aurora aurora_planning > planning_backup.sql
```

### MongoDB Databases
```bash
# Thoughts DB
mongodump --uri="mongodb://localhost:27017/aurora_thoughts" --out=/backup/thoughts

# Journals DB
mongodump --uri="mongodb://localhost:27017/aurora_journals" --out=/backup/journals
```

---

## Scaling Considerations

### Horizontal Scaling
Each service can scale independently:
```yaml
# In production (Kubernetes example)
thoughts:
  replicas: 5  # High write volume
  
journals:
  replicas: 3
  
planning:
  replicas: 2
  
identity:
  replicas: 3  # All requests need auth
```

### Database Scaling
- **PostgreSQL:** Read replicas for Identity/Planning
- **MongoDB:** Replica sets for Thoughts/Journals
- **Redis:** Cluster mode for caching

---

## Monitoring

### Health Checks
```javascript
// Each service implements
GET /health
{
  status: "healthy",
  database: "connected",
  timestamp: "2024-01-01T00:00:00Z"
}
```

### Metrics to Track
- Request rate per service
- Response time (p50, p95, p99)
- Database connection pool usage
- MongoDB operation times
- PostgreSQL query performance
- Error rates

---

## Cost Estimation

### Development (Docker Compose)
**Free** - runs on your laptop

### Small Production (1-10k users)
- 4 service containers: $80/month
- 2 PostgreSQL instances: $30/month
- 2 MongoDB instances: $40/month
- Redis: $15/month
- Load balancer: $25/month
- **Total: ~$190/month**

### Medium Production (10-100k users)
- 8-10 service containers: $200/month
- Managed PostgreSQL: $100/month
- MongoDB Atlas: $100/month
- Redis cluster: $50/month
- Load balancer: $25/month
- **Total: ~$475/month**

---

## Security Best Practices

1. **Database per Service** - Isolation, no cross-service queries
2. **JWT Validation** - Gateway validates all tokens
3. **Environment Variables** - Never commit secrets
4. **Database Passwords** - Strong, unique per database
5. **Network Isolation** - Services on private network
6. **Input Validation** - Every service validates inputs
7. **Rate Limiting** - Gateway implements per-user limits
8. **HTTPS Only** - TLS termination at load balancer

---

## Benefits of This Architecture

1. ✅ **Appropriate Complexity** - Not over-engineered, not too simple
2. ✅ **Optimal Databases** - Right tool for each job
3. ✅ **Independent Scaling** - Scale services based on load
4. ✅ **Clear Boundaries** - Well-defined service responsibilities
5. ✅ **Database Isolation** - Failures don't cascade
6. ✅ **Technology Fit** - MongoDB where flexible, PostgreSQL where structured
7. ✅ **Manageable** - 4 services, not 8
8. ✅ **Future-Proof** - Easy to add services (search, notifications) later

---

## When to Add More Services

### Add Search Service When:
- Basic MongoDB text search is insufficient
- Need advanced features (fuzzy search, relevance tuning)
- Cross-service search becomes complex
- **Then:** Add Elasticsearch/Meilisearch service

### Add Notifications Service When:
- Email volume is high
- Need push notifications
- Reminder logic becomes complex
- **Then:** Separate service with job queue

### Add Analytics Service When:
- Reporting queries slow down main services
- Need time-series data analysis
- Want complex metrics
- **Then:** Add with TimescaleDB

---

## Conclusion

This architecture provides:
- **4 core services** with appropriate databases
- **Database per service** pattern for true isolation
- **Optimal data stores** for each domain's access patterns
- **Practical complexity** - not too simple, not over-engineered
- **Room to grow** - easy to add services as needed

**Perfect balance for Aurora!** 🚀

