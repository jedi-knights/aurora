# Simple Architecture for Aurora

## Reality Check ✅

The full microservices architecture (8 services) documented in ARCHITECTURE.md is **over-engineered** for Aurora's current scope. That architecture is useful as a reference for future scaling, but let's start simple.

## Recommended: Start with a Modular Monolith

### Architecture

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
│   Port 3000 │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────────┐
│   Backend API   │
│ (Node.js/Express)│
│    Port 4000    │
└──────┬──────────┘
       │
       ├──→ PostgreSQL (5432)
       └──→ Redis (6379) - optional
```

### Single Backend Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # User auth & management
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── user.model.js
│   │   │   └── auth.routes.js
│   │   │
│   │   ├── thoughts/          # Thoughts CRUD
│   │   │   ├── thoughts.controller.js
│   │   │   ├── thoughts.service.js
│   │   │   ├── thought.model.js
│   │   │   └── thoughts.routes.js
│   │   │
│   │   ├── journals/          # Journals & entries
│   │   │   ├── journals.controller.js
│   │   │   ├── journals.service.js
│   │   │   ├── entries.service.js
│   │   │   ├── journal.model.js
│   │   │   └── journals.routes.js
│   │   │
│   │   └── planning/          # Tasks & events
│   │       ├── planning.controller.js
│   │       ├── planning.service.js
│   │       ├── task.model.js
│   │       └── planning.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── database/
│   │   ├── connection.js
│   │   └── migrations/
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   └── logger.js
│   │
│   └── server.js              # Main entry point
│
├── package.json
├── Dockerfile
└── README.md
```

## Database Schema (Single PostgreSQL Database)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Thoughts Table
```sql
CREATE TABLE thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Journals Table
```sql
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes

All routes in one API:

```javascript
// Auth routes
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me

// Thoughts routes
GET    /api/thoughts
POST   /api/thoughts
GET    /api/thoughts/:id
PUT    /api/thoughts/:id
DELETE /api/thoughts/:id

// Journals routes
GET    /api/journals
POST   /api/journals
GET    /api/journals/:id
DELETE /api/journals/:id
GET    /api/journals/:id/entries
POST   /api/journals/:id/entries
DELETE /api/journals/:id/entries/:entryId

// Planning routes
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/complete
```

## Docker Compose (Simple)

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://aurora:password@postgres:5432/aurora
      - JWT_SECRET=your-secret-key
      - NODE_ENV=development
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=aurora
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=aurora
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## Tech Stack (Simplified)

### Backend
- **Framework:** Express.js (simple) or NestJS (more structure)
- **Database:** PostgreSQL (via pg or Sequelize/Prisma ORM)
- **Auth:** JWT with bcrypt
- **Validation:** Joi or Zod
- **Testing:** Jest

### Frontend
- **Framework:** Next.js 14 (already done)
- **State:** React hooks + Context API or Zustand
- **API Client:** Fetch or Axios

### Infrastructure
- **Database:** PostgreSQL
- **Cache (optional):** Redis for sessions
- **Deployment:** Docker Compose (dev) or single container (prod)

## Why This Is Better

### Pros ✅
1. **Faster Development** - One codebase, faster iterations
2. **Simpler Debugging** - Single process, easier to trace issues
3. **Lower Costs** - One server, one database, minimal resources
4. **Easier Testing** - No distributed systems complexity
5. **Good Enough** - Handles 10k-100k users easily
6. **Still Modular** - Clean module separation, can split later

### Cons ⚠️
1. **Scaling** - Must scale entire app (but this is fine for most cases)
2. **Deploy All** - Changes require redeploying everything
3. **Single Point of Failure** - If API crashes, everything is down

But honestly, these cons don't matter until you have **significant scale**.

## When to Split into Microservices?

Only split when you experience:

### Technical Triggers
- 🔴 **API is struggling** under load and you can't scale vertically
- 🔴 **Specific feature** (like search) is a bottleneck
- 🔴 **Database** queries are slow despite optimization

### Organizational Triggers
- 👥 **10+ developers** working on the codebase
- 🏢 **Multiple teams** need independent deployment
- 🌍 **Different features** need different scaling patterns

### Feature Triggers
- 🔍 **Search** needs Elasticsearch (split Search Service)
- 📧 **Email processing** is slow (split Notifications Service)
- 📊 **Analytics** queries slow down main API (split Analytics Service)

## Migration Path

When you do need to scale:

### Step 1: Extract Heavy Features
```
Monolith → Monolith + Search Service
```

### Step 2: Split by Bounded Context
```
Monolith → Auth + Core API
```

### Step 3: Refine Further
```
Core API → Thoughts + Journals + Planning services
```

The modular structure makes this easy!

## Example Server.js (Backend)

```javascript
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

// Import routes
const authRoutes = require('./modules/auth/auth.routes')
const thoughtsRoutes = require('./modules/thoughts/thoughts.routes')
const journalsRoutes = require('./modules/journals/journals.routes')
const planningRoutes = require('./modules/planning/planning.routes')

// Import middleware
const errorMiddleware = require('./middleware/error.middleware')

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('combined'))

// Routes
app.use('/auth', authRoutes)
app.use('/api/thoughts', thoughtsRoutes)
app.use('/api/journals', journalsRoutes)
app.use('/api/tasks', planningRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})

// Error handling
app.use(errorMiddleware)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## Quick Start

```bash
# Create backend
cd backend
npm init -y
npm install express pg bcrypt jsonwebtoken cors helmet morgan

# Run with Docker
docker-compose up -d

# Or run locally
cd backend && npm run dev
cd frontend && npm run dev
```

## Performance Expectations

This simple architecture can handle:
- ✅ **10,000 users** easily
- ✅ **100,000 users** with optimization
- ✅ **Millions of records** with proper indexing
- ✅ **100 requests/second** on modest hardware

## Future Enhancements (Within Monolith)

You can add these without splitting into microservices:

1. **Full-text search** - PostgreSQL has excellent full-text search
2. **Background jobs** - Use Bull + Redis for async tasks
3. **File uploads** - S3 integration in the API
4. **Email** - SendGrid/Mailgun from the main API
5. **Caching** - Redis for frequently accessed data
6. **Rate limiting** - Express middleware

## Cost Comparison

### Simple Monolith
- 1 API server: $20/month
- PostgreSQL: $15/month
- **Total: ~$35/month** for 10k users

### Full Microservices (from ARCHITECTURE.md)
- 8 service instances: $160/month
- PostgreSQL: $100/month
- Redis: $50/month
- Elasticsearch: $100/month
- Message Queue: $50/month
- Load balancer: $25/month
- **Total: ~$485/month** for same scale

**14x more expensive** for minimal benefit at this scale!

## Conclusion

**Start simple. Scale when you actually need to.**

The full microservices architecture in ARCHITECTURE.md is a great blueprint for the future, but premature optimization is the root of all evil. Build the monolith right, keep it modular, and split only when you have real scaling needs.

Your users care about features, not architecture. Ship fast! 🚀

