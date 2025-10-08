# 🚀 START HERE - Quick Start Guide

Welcome to Aurora! This guide will get you from zero to running services in 30 minutes.

## Prerequisites

Make sure you have installed:
- **Docker** & **Docker Compose** (for databases)
- **Node.js 18+** (for services)
- **Git** (you already have this)

## Step 1: Environment Setup (2 minutes)

```bash
# You already have .env file created!
# Edit it if needed:
vim .env

# Generate a secure JWT secret (recommended):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste into .env as JWT_SECRET
```

## Step 2: Start Databases (5 minutes)

```bash
# Start all databases
docker-compose up -d

# Verify they're running
docker-compose ps

# You should see:
# ✅ postgres-identity
# ✅ postgres-planning  
# ✅ mongo-thoughts
# ✅ mongo-journals
# ✅ redis

# Check logs if any issues
docker-compose logs -f
```

## Step 3: Choose Your Path

### Path A: Full Docker (Easiest)
Everything runs in Docker containers:

```bash
# When services are implemented, just:
docker-compose up -d

# That's it! All services running.
```

### Path B: Local Development (Recommended)
Databases in Docker, services run locally:

**Terminal 1 - Identity Service:**
```bash
cd services/identity
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Gateway:**
```bash
cd services/gateway
npm install
npm run dev
# Runs on http://localhost:4000
```

**Terminal 3 - Thoughts:**
```bash
cd services/thoughts
npm install
npm run dev
# Runs on http://localhost:4001
```

**Terminal 4 - Journals:**
```bash
cd services/journals
npm install
npm run dev
# Runs on http://localhost:4002
```

**Terminal 5 - Planning:**
```bash
cd services/planning
npm install
npm run dev
# Runs on http://localhost:4003
```

**Terminal 6 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Step 4: Verify Setup (5 minutes)

### Check Databases

**PostgreSQL:**
```bash
# Connect to identity database
docker-compose exec postgres-identity psql -U aurora -d aurora_identity

# Inside psql:
\dt                    # List tables (will be empty until migrations run)
\q                     # Quit
```

**MongoDB:**
```bash
# Connect to thoughts database
docker-compose exec mongo-thoughts mongosh aurora_thoughts

# Inside mongosh:
show collections       # List collections
exit
```

**Redis:**
```bash
# Test Redis
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Access Management Tools (Optional)

With dev profile:
```bash
docker-compose --profile dev up -d
```

Then access:
- **PGAdmin:** http://localhost:5050
  - Email: admin@aurora.local
  - Password: admin
  
- **Mongo Express (Thoughts):** http://localhost:8081
  - Username: admin
  - Password: admin
  
- **Mongo Express (Journals):** http://localhost:8082
  - Username: admin
  - Password: admin

## Step 5: Implementation Order

Now that infrastructure is ready, implement services in this order:

### Week 1: Identity Service ⭐ START HERE
This is the foundation - all other services need it.

```bash
cd services/identity
```

**What to build:**
1. Express server setup
2. PostgreSQL connection
3. User model & schema
4. POST /auth/register endpoint
5. POST /auth/login endpoint
6. JWT token generation
7. Auth middleware

**Test it:**
```bash
# Register a user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# You should get back a JWT token!
```

### Week 2: API Gateway
Sets up unified entry point.

```bash
cd services/gateway
```

**What to build:**
1. Express server with proxy middleware
2. Route configuration
3. JWT validation middleware
4. Rate limiting
5. CORS setup

### Week 3-4: Domain Services
Pick one to start (Thoughts is simplest):

**Thoughts Service (Easiest):**
- MongoDB connection
- Mongoose model
- Simple CRUD
- Tag support

**Journals Service (Medium):**
- MongoDB connection
- Two collections (journals + entries)
- More complex CRUD

**Planning Service (More Complex):**
- PostgreSQL connection
- Database migrations
- Date-based queries
- Recurring logic

### Week 5-6: Frontend Integration
Update frontend to use real APIs instead of localStorage.

## Common Commands

### Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Remove everything including volumes (⚠️ deletes data)
docker-compose down -v
```

### Make Commands
```bash
make help              # Show all commands
make up                # Start services
make down              # Stop services
make logs              # View all logs
make logs-frontend     # View frontend logs
make shell-postgres    # Open PostgreSQL shell
make shell-redis       # Open Redis CLI
```

## Quick Reference

### Service Ports
- Frontend: 3000
- Gateway: 4000
- Thoughts: 4001
- Journals: 4002
- Planning: 4003
- Identity: 5000

### Database Ports
- PostgreSQL Identity: 5432
- PostgreSQL Planning: 5432 (different container)
- MongoDB Thoughts: 27017
- MongoDB Journals: 27017 (different container)
- Redis: 6379

## Troubleshooting

### Port already in use
```bash
# Find process using port
lsof -i :5000

# Kill it
kill -9 <PID>
```

### Database won't start
```bash
# Check logs
docker-compose logs postgres-identity

# Restart it
docker-compose restart postgres-identity

# Nuclear option - remove and recreate
docker-compose down -v
docker-compose up -d
```

### Can't connect to database
- Check DATABASE_URL in .env
- Verify database is running: `docker-compose ps`
- Check if firewall is blocking ports

## Resources

- 📖 [CORE_ARCHITECTURE.md](./CORE_ARCHITECTURE.md) - Complete architecture
- 📋 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Detailed implementation guide
- 🔧 [Service READMEs](./services/) - Specific service documentation
- 💡 [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) - Architecture decisions

## Getting Help

1. Check logs: `docker-compose logs -f <service>`
2. Verify databases are running: `docker-compose ps`
3. Test connection: Use management tools (PGAdmin, Mongo Express)
4. Review documentation in this repo

## Next Steps

1. ✅ Infrastructure is ready
2. 👉 **Start with Identity Service** ([services/identity/README.md](./services/identity/README.md))
3. Then Gateway
4. Then pick a domain service
5. Integrate with frontend

**You're all set! Start building! 🚀**

## Visual Progress Tracker

```
Infrastructure Setup
├─ ✅ Docker Compose configured
├─ ✅ Environment variables set
├─ ✅ Databases ready
└─ ✅ Package.json files created

Implementation (To Do)
├─ ⏳ Identity Service (Week 1) ← START HERE
├─ ⏳ API Gateway (Week 2)
├─ ⏳ Thoughts Service (Week 3)
├─ ⏳ Journals Service (Week 4)
├─ ⏳ Planning Service (Week 4-5)
└─ ⏳ Frontend Integration (Week 5-6)
```

Ready to code? Open `services/identity/` and let's build! 💪

