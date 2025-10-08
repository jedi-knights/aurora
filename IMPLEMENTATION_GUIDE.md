# Implementation Guide

## Getting Started - Step by Step

### Phase 1: Infrastructure Setup (Week 1)

#### Step 1: Test Docker Compose
```bash
# Start databases
docker-compose up -d postgres-identity postgres-planning mongo-thoughts mongo-journals redis

# Verify all are running
docker-compose ps

# Check logs
docker-compose logs -f

# Access databases to verify
docker-compose exec postgres-identity psql -U aurora -d aurora_identity
docker-compose exec mongo-thoughts mongosh aurora_thoughts
```

#### Step 2: Set Up Environment
```bash
# Create .env file
cp .env.example .env

# Edit with your values
vim .env
```

### Phase 2: Identity Service (Week 2)

**Priority:** This is the foundation - all other services depend on it.

```bash
cd services/identity
npm init -y
npm install express mongoose bcrypt jsonwebtoken express-validator cors helmet morgan dotenv
npm install --save-dev nodemon typescript @types/node @types/express ts-node

# Create structure
mkdir -p src/{routes,controllers,models,middleware,utils}
```

**Implementation Order:**
1. ✅ Basic Express server
2. ✅ Database connection
3. ✅ User model & migrations
4. ✅ Register endpoint
5. ✅ Login endpoint
6. ✅ JWT generation
7. ✅ Auth middleware
8. ✅ Token refresh
9. ✅ Password reset flow

**Test with:**
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Phase 3: API Gateway (Week 2-3)

**Priority:** Sets up unified entry point.

```bash
cd services/gateway
npm init -y
npm install express http-proxy-middleware express-rate-limit redis cors helmet morgan dotenv
npm install --save-dev nodemon

# Create structure
mkdir -p src/{middleware,utils}
```

**Implementation Order:**
1. ✅ Basic proxy setup
2. ✅ Route configuration
3. ✅ Auth middleware (validate JWT)
4. ✅ Rate limiting
5. ✅ Error handling
6. ✅ CORS configuration

### Phase 4: Core Services (Weeks 3-5)

Implement in parallel once Identity is ready:

#### A. Thoughts Service (MongoDB)
```bash
cd services/thoughts
npm init -y
npm install express mongoose express-validator cors morgan dotenv
npm install --save-dev nodemon

# Implement
- MongoDB connection
- Thought model (Mongoose schema)
- CRUD endpoints
- Tag management
- Full-text search
```

#### B. Journals Service (MongoDB)
```bash
cd services/journals
npm init -y
npm install express mongoose express-validator cors morgan dotenv pdfkit
npm install --save-dev nodemon

# Implement
- MongoDB connection
- Journal & Entry models
- CRUD endpoints
- Sharing functionality
- Export features
```

#### C. Planning Service (PostgreSQL)
```bash
cd services/planning
npm init -y
npm install express pg express-validator cors morgan dotenv date-fns
npm install --save-dev nodemon

# Implement
- PostgreSQL connection
- Database migrations
- Task model
- CRUD endpoints
- Calendar views
- Recurring tasks logic
```

### Phase 5: Frontend Integration (Week 6)

Update frontend to use backend APIs instead of localStorage:

```javascript
// frontend/src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api = {
  // Auth
  register: (data) => fetch(`${API_URL}/auth/register`, { ... }),
  login: (data) => fetch(`${API_URL}/auth/login`, { ... }),
  
  // Thoughts
  getThoughts: () => fetch(`${API_URL}/api/thoughts`, { ... }),
  createThought: (data) => fetch(`${API_URL}/api/thoughts`, { ... }),
  
  // ... etc
}
```

## Development Workflow

### Running Locally

**Option 1: All in Docker**
```bash
docker-compose up -d
# All services run in containers
```

**Option 2: Hybrid (recommended for development)**
```bash
# Databases in Docker
docker-compose up -d postgres-identity postgres-planning mongo-thoughts mongo-journals redis

# Services locally (separate terminals)
cd services/identity && npm run dev
cd services/gateway && npm run dev
cd services/thoughts && npm run dev
cd services/journals && npm run dev
cd services/planning && npm run dev
cd frontend && npm run dev
```

### Testing Each Service

Create a `test.http` file for each service (use REST Client extension in VS Code):

```http
### Register User
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}

### Login
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Create Thought (requires token)
POST http://localhost:4001/api/thoughts
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "text": "This is my first thought",
  "tags": ["idea", "test"]
}
```

## Database Migrations

### PostgreSQL (Identity & Planning)

Use a migration tool like `node-pg-migrate`:

```bash
npm install --save-dev node-pg-migrate

# Create migration
npm run migrate create initial-schema

# Run migrations
npm run migrate up
```

Example migration:
```javascript
// migrations/1234567890_initial-schema.js
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'varchar(255)', unique: true, notNull: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    name: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', default: pgm.func('NOW()') }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('users')
}
```

### MongoDB (Thoughts & Journals)

Use Mongoose - no migrations needed! Just create indexes:

```javascript
// On application startup
async function setupIndexes() {
  await Thought.collection.createIndex({ userId: 1, timestamp: -1 })
  await Thought.collection.createIndex({ text: 'text' })
  console.log('Indexes created')
}
```

## Monitoring & Debugging

### Health Checks
Each service should have:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'identity',
    database: db.isConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})
```

### Logging
Use consistent logging:
```javascript
const morgan = require('morgan')
app.use(morgan('combined'))

// For errors
console.error('[ERROR]', error.message, error.stack)
```

### Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f identity

# Tail last 100 lines
docker-compose logs --tail=100 thoughts
```

## Common Issues & Solutions

### Issue: Database Connection Fails
```bash
# Check if database is running
docker-compose ps

# Check logs
docker-compose logs postgres-identity

# Restart database
docker-compose restart postgres-identity
```

### Issue: Port Already in Use
```bash
# Find what's using the port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Issue: CORS Errors
Make sure gateway has proper CORS:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
```

### Issue: JWT Token Not Working
- Check JWT_SECRET is same across services
- Verify token format: `Authorization: Bearer <token>`
- Check token expiry

## Production Checklist

Before deploying to production:

- [ ] Environment variables set (no defaults)
- [ ] Strong passwords for databases
- [ ] JWT_SECRET is cryptographically random
- [ ] HTTPS enabled (TLS termination at load balancer)
- [ ] Rate limiting configured
- [ ] CORS restricted to your domain
- [ ] Database backups configured
- [ ] Monitoring/alerting set up
- [ ] Logs aggregated
- [ ] Health checks configured
- [ ] Docker images optimized (multi-stage builds)
- [ ] Database connection pooling configured
- [ ] Redis persistence enabled

## Recommended Tools

### Development
- **VS Code** with extensions:
  - REST Client (API testing)
  - MongoDB for VS Code
  - PostgreSQL Explorer
  - Docker
  - ESLint
  - Prettier

### Database Management
- **PGAdmin** - PostgreSQL GUI (http://localhost:5050)
- **Mongo Express** - MongoDB GUI (http://localhost:8081-8082)
- **Redis Commander** - Redis GUI (add to docker-compose if needed)

### API Testing
- **Postman** or **Insomnia** - API client
- **Thunder Client** - VS Code extension
- **curl** - Command line

### Monitoring (Later)
- **Prometheus** + **Grafana** - Metrics
- **Loki** - Log aggregation
- **Sentry** - Error tracking

## Next Steps

1. **Start with Identity Service** - Get auth working first
2. **Add Gateway** - Set up unified entry point
3. **Implement one domain service** (Thoughts is simplest)
4. **Test end-to-end** - Frontend → Gateway → Service → Database
5. **Repeat for other services**
6. **Polish and optimize**

## Getting Help

If you get stuck:
1. Check service logs: `docker-compose logs -f <service>`
2. Verify database connection: Connect directly to verify data
3. Test endpoints with curl/Postman
4. Check CORE_ARCHITECTURE.md for reference
5. Review service-specific READMEs

## Timeline Estimate

- Week 1: Infrastructure & Identity
- Week 2-3: Gateway + One service
- Week 4-5: Remaining services
- Week 6: Frontend integration
- Week 7-8: Testing & polish

**Total: ~2 months to MVP**

Good luck! 🚀

