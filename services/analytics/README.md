# Analytics Service

User insights and statistics service.

## Bounded Context

User Insights and Statistics

## Responsibilities

- Usage statistics and metrics
- Productivity insights
- Data visualization
- Trends and patterns analysis
- Export analytics data
- Aggregate metrics across all services

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Time-Series DB:** TimescaleDB or InfluxDB
- **Cache:** Redis
- **Message Queue:** RabbitMQ/Kafka

## Database Schema (TimescaleDB)

### Activity Metrics Table
```sql
CREATE TABLE activity_metrics (
    time TIMESTAMPTZ NOT NULL,
    user_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value NUMERIC,
    metadata JSONB
);

SELECT create_hypertable('activity_metrics', 'time');

CREATE INDEX idx_activity_user_metric ON activity_metrics (user_id, metric_type, time DESC);
```

### Daily Aggregates Table
```sql
CREATE TABLE daily_aggregates (
    date DATE NOT NULL,
    user_id UUID NOT NULL,
    thoughts_count INTEGER DEFAULT 0,
    journal_entries_count INTEGER DEFAULT 0,
    tasks_created_count INTEGER DEFAULT 0,
    tasks_completed_count INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    PRIMARY KEY (date, user_id)
);
```

## Metric Types

### Thoughts Metrics
- `thoughts.created` - Count of thoughts created
- `thoughts.created.per_day` - Daily average
- `thoughts.trend` - Growth trend

### Journals Metrics
- `journals.entries_created` - Entry count
- `journals.streak` - Consecutive days journaling
- `journals.word_count` - Total words written

### Tasks Metrics
- `tasks.created` - Tasks created
- `tasks.completed` - Tasks completed
- `tasks.completion_rate` - Completion percentage
- `tasks.overdue` - Overdue task count
- `tasks.on_time_completion` - On-time completion rate

### Events Metrics
- `events.created` - Events scheduled
- `events.attended` - Events marked as attended

### Productivity Metrics
- `productivity.score` - Overall productivity score
- `productivity.streak` - Current active streak
- `productivity.best_streak` - Longest streak

## API Endpoints

### Overview
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/summary?period=week|month|year` - Summary stats

### Thoughts Analytics
- `GET /api/analytics/thoughts/stats`
- `GET /api/analytics/thoughts/trends?days=30`
- `GET /api/analytics/thoughts/word-cloud`

### Journals Analytics
- `GET /api/analytics/journals/stats`
- `GET /api/analytics/journals/streak`
- `GET /api/analytics/journals/writing-time`
- `GET /api/analytics/journals/word-count`

### Tasks Analytics
- `GET /api/analytics/tasks/stats`
- `GET /api/analytics/tasks/completion-rate`
- `GET /api/analytics/tasks/productivity-score`
- `GET /api/analytics/tasks/categories`

### Productivity
- `GET /api/analytics/productivity`
- `GET /api/analytics/productivity/heatmap?year=2024`
- `GET /api/analytics/productivity/best-times`

### Export
- `GET /api/analytics/export?format=json|csv&period=year`

## Environment Variables

```env
# TimescaleDB
TIMESCALE_URL=postgresql://user:password@localhost:5432/aurora_analytics

# or InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=aurora
INFLUXDB_BUCKET=analytics

REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
IDENTITY_SERVICE_URL=http://identity:5000
PORT=4006
NODE_ENV=development
```

## Events Consumed

Consumes all domain events for analytics:

### From Thoughts Service
- `ThoughtCreated` → Increment thought counter

### From Journals Service
- `EntryCreated` → Update journal stats, check streak
- `JournalCreated` → Track journal count

### From Planning Service
- `TaskCreated` → Track task creation
- `TaskCompleted` → Update completion rate, productivity score
- `EventCreated` → Track event scheduling

## Analytics Calculations

### Productivity Score
```javascript
const calculateProductivityScore = (data) => {
  const weights = {
    tasksCompleted: 0.4,
    journalEntries: 0.3,
    thoughtsCaptured: 0.2,
    streak: 0.1
  }
  
  return (
    data.tasksCompleted * weights.tasksCompleted +
    data.journalEntries * weights.journalEntries +
    data.thoughtsCaptured * weights.thoughtsCaptured +
    data.streak * weights.streak
  )
}
```

### Streak Calculation
```javascript
const calculateStreak = async (userId) => {
  let streak = 0
  let date = new Date()
  
  while (true) {
    const hasActivity = await checkActivityForDate(userId, date)
    if (!hasActivity) break
    streak++
    date.setDate(date.getDate() - 1)
  }
  
  return streak
}
```

## Scheduled Jobs

### Daily Aggregation
Runs at midnight to aggregate previous day's data:

```javascript
cron.schedule('0 0 * * *', async () => {
  await aggregateDailyMetrics()
})
```

### Weekly Summary
Generates weekly summary for users:

```javascript
cron.schedule('0 8 * * 1', async () => {
  await generateWeeklySummary()
})
```

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

## Visualization Examples

### Activity Heatmap
GitHub-style heatmap showing daily activity

### Productivity Trends
Line chart showing productivity score over time

### Category Distribution
Pie chart of task completion by category

### Writing Stats
Word count trends, average entry length

## Privacy Considerations

- Analytics data is per-user only
- No cross-user aggregation without explicit permission
- Export and delete capabilities (GDPR compliance)
- Anonymized data for system-wide metrics

