# Identity Service - Quick Start

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd services/identity
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env if needed
```

### 3. Run Database Migration
```bash
# Make sure postgres-identity container is running
docker-compose up -d postgres-identity

# Run migration
psql $DATABASE_URL < migrations/001_create_users_table.sql

# Or connect and run manually:
docker-compose exec postgres-identity psql -U aurora -d aurora_identity
# Then paste the SQL from migrations/001_create_users_table.sql
```

### 4. Start Service
```bash
npm run dev
```

Service will run on http://localhost:5000

## Test It

### Register a User
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### Health Check
```bash
curl http://localhost:5000/health
```

## Architecture Overview

```
src/
├── domain/              # Business logic (no dependencies)
│   ├── entities/        # User entity
│   └── repositories/    # IUserRepository interface
│
├── application/         # Use cases
│   ├── useCases/        # RegisterUserUseCase, LoginUserUseCase
│   └── dto/             # UserDTO
│
├── infrastructure/      # External concerns
│   ├── database/        # PostgresUserRepository
│   ├── http/            # Controllers, routes
│   └── external/        # External services
│
└── shared/              # Utilities
    ├── errors/          # Custom errors
    ├── logger/          # Logging
    └── utils/           # TokenService
```

## What's Implemented

✅ User entity with validation
✅ Register user use case
✅ Login user use case
✅ PostgreSQL repository
✅ JWT token generation
✅ Express controllers & routes
✅ Error handling
✅ Input validation
✅ Hexagonal architecture
✅ SOLID principles
✅ Cyclomatic complexity ≤ 7

## Next Steps

1. ✅ Test register & login
2. Add more use cases:
   - RefreshTokenUseCase
   - GetUserUseCase
   - UpdateUserUseCase
   - ChangePasswordUseCase
3. Add auth middleware for protected routes
4. Add unit tests
5. Add integration tests

## Code Quality

Run linter:
```bash
npm run lint
```

This enforces:
- Cyclomatic complexity ≤ 7
- Max function length
- Max depth
- Max parameters

## Troubleshooting

**Database connection fails:**
```bash
# Check if postgres is running
docker-compose ps postgres-identity

# Check logs
docker-compose logs postgres-identity

# Restart
docker-compose restart postgres-identity
```

**Port 5000 in use:**
```bash
# Find process
lsof -i :5000

# Kill it or change PORT in .env
```

## Working Service! 🎉

You now have a fully functional Identity Service following:
- Hexagonal Architecture
- SOLID principles
- DRY code
- Low cyclomatic complexity
- CLEAN code

Ready to build the next service!

