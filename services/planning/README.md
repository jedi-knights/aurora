# Planning Service

Task and event management service.

## Bounded Context

Task and Event Management

## Responsibilities

- Create, read, update, delete tasks and events
- Calendar view generation
- Recurring tasks/events
- Task completion tracking
- Reminders and notifications trigger
- Task categorization and prioritization

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Database:** PostgreSQL
- **Message Queue:** RabbitMQ/Kafka

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    due_time TIME,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    category VARCHAR(50) DEFAULT 'todo' CHECK (category IN ('todo', 'event')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### Task Categories Table
```sql
CREATE TABLE task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);
```

### Task Labels Table
```sql
CREATE TABLE task_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark as complete
- `PATCH /api/tasks/:id/uncomplete` - Mark as incomplete

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Calendar
- `GET /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD&view=day|week|month` - Get calendar data

### Categories
- `GET /api/categories` - List user categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aurora_planning
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
IDENTITY_SERVICE_URL=http://identity:5000
PORT=4003
NODE_ENV=development
```

## Events Published

- `TaskCreated` - { id, user_id, title, date, due_time }
- `TaskUpdated`
- `TaskCompleted` - { id, user_id, completed_at }
- `TaskDeleted`
- `EventCreated`
- `EventUpdated`
- `EventDeleted`
- `TaskDueReminder` - { task_id, user_id, title, due_time }

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

