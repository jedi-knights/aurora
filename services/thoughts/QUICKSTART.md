# Thoughts Service - Quick Start

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd services/thoughts
npm install
```

### 2. Setup Environment
```bash
# .env file will be created from example
# Make sure MongoDB is running
```

### 3. Start MongoDB
```bash
# Make sure mongo-thoughts container is running
docker-compose up -d mongo-thoughts

# Check it's running
docker-compose ps mongo-thoughts
```

### 4. Start Service
```bash
npm run dev
```

Service will run on http://localhost:4001

## Test It (Requires Identity Service Running)

### 1. First, get an auth token from Identity service

```bash
# Register (if not done already)
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'

# Login to get token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Copy the accessToken from response
```

### 2. Use the token for Thoughts endpoints

```bash
# Set your token
TOKEN="your-access-token-here"

# Create a thought
curl -X POST http://localhost:4001/api/thoughts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"text":"This is my first thought","tags":["idea","test"]}'

# Get all thoughts
curl -X GET http://localhost:4001/api/thoughts \
  -H "Authorization: Bearer $TOKEN"

# Search thoughts
curl -X GET "http://localhost:4001/api/thoughts/search?q=first" \
  -H "Authorization: Bearer $TOKEN"

# Get thoughts by tag
curl -X GET "http://localhost:4001/api/thoughts?tag=idea" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Health Check
```bash
curl http://localhost:4001/health
```

## Architecture Overview

```
src/
├── domain/              # Business logic
│   ├── entities/        # Thought entity
│   └── repositories/    # IThoughtRepository
│
├── application/         # Use cases
│   ├── useCases/        # 6 use cases
│   └── dto/             # ThoughtDTO
│
├── infrastructure/      # External concerns
│   ├── database/        # MongoDB adapter
│   └── http/            # Controllers, routes
│
└── shared/              # Utilities
    ├── errors/          # 5 error classes
    └── logger/          # Logging
```

## What's Implemented

✅ Thought entity with validation
✅ Create thought
✅ Get thought(s)
✅ Update thought
✅ Delete thought
✅ Search thoughts (full-text)
✅ Filter by tags
✅ MongoDB repository
✅ Auth middleware (calls Identity service)
✅ Ownership verification
✅ Hexagonal architecture
✅ SOLID principles
✅ Cyclomatic complexity ≤ 7

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header:

- `POST /api/thoughts` - Create thought
- `GET /api/thoughts` - Get all thoughts (with pagination)
- `GET /api/thoughts/search?q=query` - Search thoughts
- `GET /api/thoughts?tag=idea` - Filter by tag
- `GET /api/thoughts/:id` - Get specific thought
- `PUT /api/thoughts/:id` - Update thought
- `DELETE /api/thoughts/:id` - Delete thought

## Query Parameters

**GET /api/thoughts:**
- `limit` (default: 50, max: 100)
- `offset` (default: 0)
- `tag` - Filter by tag
- `sortBy` - 'timestamp' or 'createdAt'
- `order` - 'asc' or 'desc'

## Next Steps

1. ✅ Test all endpoints
2. Add unit tests
3. Add integration tests
4. Deploy with Docker

## Troubleshooting

**MongoDB connection fails:**
```bash
docker-compose ps mongo-thoughts
docker-compose logs mongo-thoughts
docker-compose restart mongo-thoughts
```

**Auth fails:**
- Make sure Identity service is running on port 5000
- Check that token is valid (not expired)
- Verify IDENTITY_SERVICE_URL in .env

**Port 4001 in use:**
```bash
lsof -i :4001
# Kill process or change PORT in .env
```

## MongoDB Queries

```bash
# Connect to MongoDB
docker-compose exec mongo-thoughts mongosh aurora_thoughts

# List thoughts
db.thoughts.find().pretty()

# Count thoughts
db.thoughts.countDocuments()

# Find by user
db.thoughts.find({ userId: "user-id" }).pretty()

# Find by tag
db.thoughts.find({ tags: "idea" }).pretty()
```

## Working Service! 🎉

You now have a fully functional Thoughts Service with:
- Hexagonal Architecture
- MongoDB integration
- Full CRUD + Search
- Auth integration
- SOLID/DRY/CLEAN code
- Low complexity

Two services down, three to go! 💪

