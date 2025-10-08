# Aurora Microservices Architecture

## Overview

Aurora follows a microservices architecture based on Domain-Driven Design (DDD) bounded contexts. Each service is independently deployable, scalable, and maintains its own data store.

## Bounded Contexts & Microservices

### 1. Identity Service (Auth & User Management)
**Bounded Context:** User Identity and Access Management

**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- Password management (reset, change)
- OAuth integration (Google, GitHub, etc.)
- User profile management
- Role-based access control (RBAC)
- Session management

**Data Owned:**
- Users (id, email, password_hash, profile)
- Roles and permissions
- OAuth tokens
- Refresh tokens (Redis)
- Sessions (Redis)

**API Endpoints:**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/reset-password`
- `GET /users/me`
- `PUT /users/me`
- `DELETE /users/me`

**Technology Stack:**
- Node.js/Express or NestJS
- PostgreSQL for user data
- Redis for sessions/tokens
- Passport.js for auth strategies
- bcrypt for password hashing

---

### 2. Thoughts Service
**Bounded Context:** Quick Thought Capture and Retrieval

**Responsibilities:**
- Create, read, update, delete thoughts
- Tag management for thoughts
- Search within thoughts
- Export thoughts
- Thought statistics

**Data Owned:**
- Thoughts (id, user_id, text, timestamp, tags)
- Thought tags

**API Endpoints:**
- `GET /api/thoughts`
- `POST /api/thoughts`
- `GET /api/thoughts/:id`
- `PUT /api/thoughts/:id`
- `DELETE /api/thoughts/:id`
- `GET /api/thoughts/search?q=query`
- `GET /api/thoughts/tags`
- `POST /api/thoughts/:id/tags`

**Events Published:**
- `ThoughtCreated`
- `ThoughtUpdated`
- `ThoughtDeleted`

**Technology Stack:**
- Node.js/Express
- PostgreSQL or MongoDB
- Full-text search (PostgreSQL or Elasticsearch)

---

### 3. Journals Service
**Bounded Context:** Structured Journal Management

**Responsibilities:**
- Create, read, update, delete journals
- Manage journal entries
- Journal sharing and permissions
- Journal templates
- Entry versioning
- Export journals (PDF, Markdown)

**Data Owned:**
- Journals (id, user_id, name, description, settings)
- Journal Entries (id, journal_id, content, timestamp)
- Journal permissions (for sharing)
- Entry versions (for history)

**API Endpoints:**
- `GET /api/journals`
- `POST /api/journals`
- `GET /api/journals/:id`
- `PUT /api/journals/:id`
- `DELETE /api/journals/:id`
- `GET /api/journals/:id/entries`
- `POST /api/journals/:id/entries`
- `GET /api/journals/:id/entries/:entryId`
- `PUT /api/journals/:id/entries/:entryId`
- `DELETE /api/journals/:id/entries/:entryId`
- `POST /api/journals/:id/share`
- `GET /api/journals/:id/export`

**Events Published:**
- `JournalCreated`
- `JournalUpdated`
- `JournalDeleted`
- `EntryCreated`
- `EntryUpdated`
- `EntryDeleted`

**Technology Stack:**
- Node.js/Express or NestJS
- PostgreSQL (strong consistency for journal structure)
- S3 or MinIO for attachments

---

### 4. Planning Service
**Bounded Context:** Task and Event Management

**Responsibilities:**
- Create, read, update, delete tasks and events
- Calendar view generation
- Recurring tasks/events
- Task completion tracking
- Reminders and notifications
- Task categorization and prioritization

**Data Owned:**
- Tasks (id, user_id, title, date, completed, category, priority)
- Events (id, user_id, title, date, time, duration)
- Recurring patterns
- Task categories

**API Endpoints:**
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/complete`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/calendar?start=date&end=date`

**Events Published:**
- `TaskCreated`
- `TaskCompleted`
- `TaskDeleted`
- `EventCreated`
- `EventUpdated`
- `EventDeleted`

**Technology Stack:**
- Node.js/Express
- PostgreSQL
- Message queue for reminders

---

### 5. Search Service
**Bounded Context:** Cross-Domain Search and Discovery

**Responsibilities:**
- Unified search across thoughts, journals, and tasks
- Index management
- Search suggestions
- Recent searches
- Search analytics

**Data Owned:**
- Search indices (denormalized data from other services)
- Search history
- Search preferences

**API Endpoints:**
- `GET /api/search?q=query&types=thoughts,journals,tasks`
- `GET /api/search/suggestions?q=partial`
- `GET /api/search/recent`
- `DELETE /api/search/history`

**Events Consumed:**
- `ThoughtCreated`, `ThoughtUpdated`, `ThoughtDeleted`
- `JournalCreated`, `EntryCreated`, etc.
- `TaskCreated`, `TaskUpdated`, `TaskDeleted`

**Technology Stack:**
- Node.js/Express
- Elasticsearch or Meilisearch
- Redis for caching

---

### 6. Notifications Service
**Bounded Context:** User Notifications and Reminders

**Responsibilities:**
- Task reminders
- Event notifications
- Email notifications
- Push notifications
- In-app notifications
- Notification preferences

**Data Owned:**
- Notifications (id, user_id, type, content, read, timestamp)
- Notification preferences
- Notification templates

**API Endpoints:**
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `DELETE /api/notifications/:id`
- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`

**Events Consumed:**
- `TaskCreated` (with due date)
- `EventCreated`
- Various other events for notification triggers

**Technology Stack:**
- Node.js/Express
- PostgreSQL for notification history
- Redis for queue
- SendGrid/AWS SES for email
- Firebase/OneSignal for push notifications

---

### 7. Analytics Service
**Bounded Context:** User Insights and Statistics

**Responsibilities:**
- Usage statistics
- Productivity metrics
- Data visualization
- Trends and patterns
- Export analytics data

**Data Owned:**
- Aggregated metrics
- Time-series data
- User activity logs

**API Endpoints:**
- `GET /api/analytics/overview`
- `GET /api/analytics/thoughts/stats`
- `GET /api/analytics/journals/stats`
- `GET /api/analytics/tasks/stats`
- `GET /api/analytics/productivity`

**Events Consumed:**
- All domain events for analytics

**Technology Stack:**
- Node.js/Express
- TimescaleDB or InfluxDB
- Redis for caching

---

### 8. API Gateway (BFF - Backend for Frontend)
**Bounded Context:** API Composition and Routing

**Responsibilities:**
- Request routing to microservices
- Authentication middleware
- Rate limiting
- API versioning
- Request/response transformation
- Aggregation of multiple service calls
- Caching

**Technology Stack:**
- Node.js with Express
- Or use Kong/Nginx/Traefik
- Redis for rate limiting and caching

---

## Cross-Cutting Concerns

### Service Mesh
- **Istio** or **Linkerd** for service-to-service communication
- Circuit breaking
- Retry logic
- Distributed tracing

### Message Queue
- **RabbitMQ** or **Apache Kafka** for event-driven communication
- Ensures eventual consistency
- Enables asynchronous processing

### Observability
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** or **Loki** for logging
- **Jaeger** or **Zipkin** for distributed tracing
- **Sentry** for error tracking

### Configuration Management
- **Consul** or **etcd** for service discovery
- Environment-based configuration
- Feature flags

---

## Data Flow Examples

### Creating a Thought
1. Frontend → API Gateway → Identity Service (validate token)
2. API Gateway → Thoughts Service → Create thought
3. Thoughts Service → Event Bus (ThoughtCreated)
4. Search Service consumes event → Updates index
5. Analytics Service consumes event → Updates metrics

### Searching
1. Frontend → API Gateway → Search Service
2. Search Service queries indices
3. Returns aggregated results from multiple domains

### Task Reminder
1. Planning Service → Event Bus (TaskDueReminder)
2. Notifications Service consumes event
3. Notifications Service → Email/Push notification
4. Notifications Service → Creates in-app notification

---

## Service Communication Patterns

### Synchronous (REST/gRPC)
- API Gateway ↔ Services
- Services ↔ Identity Service (token validation)
- Direct queries when immediate response needed

### Asynchronous (Event-Driven)
- Domain events between services
- Analytics updates
- Search index updates
- Notifications

### Database per Service
- Each service owns its data
- No direct database access between services
- Use events for data synchronization

---

## Deployment Strategy

### Development
```
docker-compose up
```
All services run locally with shared network

### Staging/Production
- **Kubernetes** for orchestration
- **Helm** charts for deployment
- Horizontal auto-scaling
- Rolling updates
- Blue-green deployments

---

## Service Dependency Graph

```
                    ┌─────────────┐
                    │   Frontend  │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    │    (BFF)    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
   │Identity │      │ Thoughts  │     │ Journals  │
   │ Service │      │  Service  │     │  Service  │
   └─────────┘      └─────┬─────┘     └─────┬─────┘
                          │                  │
        ┌──────────────┬──┴──────────┬───────┘
        │              │             │
   ┌────▼────┐   ┌────▼────┐   ┌───▼────┐
   │Planning │   │ Search  │   │Notifs  │
   │ Service │   │ Service │   │Service │
   └─────────┘   └─────────┘   └────────┘
                      │
                 ┌────▼────┐
                 │Analytics│
                 │ Service │
                 └─────────┘
```

---

## Recommended Implementation Order

1. **Phase 1: Foundation**
   - Identity Service (critical for auth)
   - API Gateway
   - Basic infrastructure (DB, Redis, Message Queue)

2. **Phase 2: Core Features**
   - Thoughts Service
   - Journals Service
   - Planning Service

3. **Phase 3: Enhanced Features**
   - Search Service
   - Notifications Service

4. **Phase 4: Insights**
   - Analytics Service

---

## Benefits of This Architecture

1. **Scalability**: Scale services independently based on load
2. **Resilience**: Failure in one service doesn't break others
3. **Team Autonomy**: Teams can work on services independently
4. **Technology Flexibility**: Each service can use best-fit technology
5. **Deployment Independence**: Deploy services without affecting others
6. **Clear Boundaries**: Well-defined responsibilities per service
7. **Data Isolation**: Each service owns its data
8. **Evolution**: Easy to add new features as new services

---

## Potential Challenges & Solutions

### Challenge: Distributed Transactions
**Solution**: Use Saga pattern or eventual consistency with compensating transactions

### Challenge: Data Duplication
**Solution**: Accept denormalization for read optimization, use events for sync

### Challenge: Service Discovery
**Solution**: Use service mesh (Istio) or service registry (Consul)

### Challenge: Testing Complexity
**Solution**: Contract testing, integration test environments, service mocking

### Challenge: Operational Complexity
**Solution**: Strong observability, automation, service mesh, good monitoring

---

## Alternative: Modular Monolith First

If team size is small (<5 developers), consider starting with a **modular monolith**:
- Same bounded contexts
- Separate modules within one codebase
- Shared database with schema separation
- Can be split into microservices later when needed

This reduces operational complexity while maintaining clean architecture.

