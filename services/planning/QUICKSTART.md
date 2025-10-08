# Planning Service - Quick Start

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd services/planning
npm install
```

### 2. Run Database Migration
```bash
# Make sure postgres-planning container is running
docker-compose up -d postgres-planning

# Run migration
docker-compose exec postgres-planning psql -U aurora -d aurora_planning -f /path/to/migrations/001_create_tasks_table.sql

# Or manually:
docker-compose exec postgres-planning psql -U aurora -d aurora_planning
# Then paste SQL from migrations/001_create_tasks_table.sql
```

### 3. Start Service
```bash
npm run dev
```

Service will run on http://localhost:4003

## Test It (Requires Identity Service Running)

### 1. Get auth token
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

TOKEN="your-token-here"
```

### 2. Create a task
```bash
curl -X POST http://localhost:4003/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Complete Planning Service",
    "description": "Finish implementing the planning microservice",
    "date": "2024-10-15",
    "category": "todo",
    "priority": "high"
  }'

# Save the task ID
TASK_ID="task-id-from-response"
```

### 3. Create an event
```bash
curl -X POST http://localhost:4003/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly sync",
    "date": "2024-10-16",
    "dueTime": "14:00",
    "category": "event",
    "priority": "medium"
  }'
```

### 4. Get all tasks
```bash
curl -X GET http://localhost:4003/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Filter by category
curl -X GET "http://localhost:4003/api/tasks?category=todo" \
  -H "Authorization: Bearer $TOKEN"

# Filter by completed status
curl -X GET "http://localhost:4003/api/tasks?completed=false" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Complete a task
```bash
curl -X PATCH http://localhost:4003/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get calendar view
```bash
curl -X GET "http://localhost:4003/api/tasks/calendar?start=2024-10-01&end=2024-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Update task
```bash
curl -X PUT http://localhost:4003/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Task Title",
    "priority": "urgent"
  }'
```

### 8. Delete task
```bash
curl -X DELETE http://localhost:4003/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

## What's Implemented

✅ Task entity with validation
✅ PostgreSQL repository  
✅ Create task/event
✅ Get tasks (filtered by status, category)
✅ Update task
✅ Delete task
✅ Complete/uncomplete task
✅ Calendar view (date range queries)
✅ Priority levels (low, medium, high, urgent)
✅ Categories (todo, event)
✅ Date-based queries optimized
✅ Hexagonal architecture
✅ SOLID/DRY/CLEAN code
✅ Cyclomatic complexity ≤ 7

## API Endpoints

- `POST /api/tasks` - Create task/event
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/calendar?start=DATE&end=DATE` - Calendar view
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Mark as complete
- `DELETE /api/tasks/:id` - Delete task

## Query Parameters

**GET /api/tasks:**
- `limit` (default: 50, max: 100)
- `offset` (default: 0)
- `completed` (true/false)
- `category` (todo/event)

**GET /api/tasks/calendar:**
- `start` (required, ISO date)
- `end` (required, ISO date)

## Database Schema

```sql
tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  due_time TIME,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  category VARCHAR(50) ('todo' | 'event'),
  priority VARCHAR(20) ('low' | 'medium' | 'high' | 'urgent'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Working Service! 🎉

Four services working now:
- ✅ Identity Service
- ✅ Thoughts Service
- ✅ Journals Service
- ✅ Planning Service

80% complete! Just Gateway to go! 💪

