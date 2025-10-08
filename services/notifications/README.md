# Notifications Service

User notifications and reminders service.

## Bounded Context

User Notifications and Reminders

## Responsibilities

- Task and event reminders
- Email notifications
- Push notifications (web/mobile)
- In-app notifications
- Notification preferences management
- Notification delivery tracking

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Database:** PostgreSQL
- **Queue:** Redis/Bull for scheduled jobs
- **Email:** SendGrid, AWS SES, or Mailgun
- **Push:** Firebase Cloud Messaging (FCM), OneSignal
- **Message Queue:** RabbitMQ/Kafka

## Database Schema

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### Notification Preferences Table
```sql
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    task_reminders BOOLEAN DEFAULT TRUE,
    event_reminders BOOLEAN DEFAULT TRUE,
    reminder_minutes_before INTEGER DEFAULT 15,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Push Tokens Table
```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('web', 'ios', 'android')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    UNIQUE(token)
);
```

## API Endpoints

### Notifications
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Clear all notifications

### Preferences
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences

### Push Tokens
- `POST /api/notifications/push/register` - Register push token
- `DELETE /api/notifications/push/unregister` - Unregister token

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aurora_notifications
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
IDENTITY_SERVICE_URL=http://identity:5000

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=notifications@aurora.app

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
# or
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_API_KEY=your-api-key

# Frontend
FRONTEND_URL=http://localhost:3000

PORT=4005
NODE_ENV=development
```

## Events Consumed

### From Planning Service
- `TaskCreated` → Schedule reminder if has due_time
- `TaskUpdated` → Update/reschedule reminder
- `TaskDeleted` → Cancel reminder
- `EventCreated` → Schedule event reminder
- `EventUpdated` → Update reminder
- `EventDeleted` → Cancel reminder

### From Journals Service
- `EntryCreated` → Streak notification (if daily journaling)

### From Identity Service
- `UserRegistered` → Welcome email

## Notification Types

### In-App Notifications
- Stored in database
- Displayed in notification center
- Real-time via WebSocket (future)

### Email Notifications
- Welcome email
- Password reset
- Daily/weekly summaries
- Task due reminders
- Event reminders

### Push Notifications
- Task due soon
- Event starting
- Streak reminders

## Scheduled Jobs

### Reminder Checker
Runs every minute to check for pending reminders:

```javascript
cron.schedule('* * * * *', async () => {
  const now = new Date()
  const pendingReminders = await getTasksDue(now, userPreferences.reminder_minutes_before)
  
  for (const task of pendingReminders) {
    await sendNotification(task.user_id, {
      type: 'task_reminder',
      title: 'Task Due Soon',
      content: `${task.title} is due in ${preferences.reminder_minutes_before} minutes`
    })
  }
})
```

### Daily Summary
Sends daily summary at user's preferred time:

```javascript
cron.schedule('0 8 * * *', async () => {
  // Send daily summary to users who opted in
})
```

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

## Testing

```bash
# Send test notification
npm run test:notification

# Test email
npm run test:email
```

## WebSocket Support (Future)

Real-time notifications via Socket.IO:
- Connect: `/notifications/socket`
- Event: `new_notification`
- Event: `notification_read`

