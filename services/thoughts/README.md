# Thoughts Service

Quick thought capture and retrieval service.

## Bounded Context

Quick Thought Capture and Retrieval

## Responsibilities

- Create, read, update, delete thoughts
- Tag management for thoughts
- Search within thoughts
- Export thoughts
- Thought statistics

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Database:** MongoDB (optimized for high write volume, simple documents)
- **Cache:** Redis
- **ODM:** Mongoose

## Database Schema

### MongoDB Collection: thoughts

```javascript
{
  _id: ObjectId,
  userId: String,          // References user from Identity service
  text: String,            // The thought content
  timestamp: Date,         // When thought was captured
  tags: [String],          // Array of tags
  metadata: {
    wordCount: Number,
    hasAttachment: Boolean,
    // Flexible schema for future additions
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
// Compound index for user's thoughts by date
db.thoughts.createIndex({ userId: 1, timestamp: -1 })

// Index for filtering by tags
db.thoughts.createIndex({ userId: 1, tags: 1 })

// Full-text search index
db.thoughts.createIndex({ text: "text" })

// User's thoughts count
db.thoughts.createIndex({ userId: 1 })
```

### Mongoose Schema Example
```javascript
const thoughtSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    wordCount: Number,
    hasAttachment: { type: Boolean, default: false }
  }
}, {
  timestamps: true
})

// Compound indexes
thoughtSchema.index({ userId: 1, timestamp: -1 })
thoughtSchema.index({ userId: 1, tags: 1 })
thoughtSchema.index({ text: 'text' })
```

## API Endpoints

### Thoughts
- `GET /api/thoughts` - List user's thoughts (paginated)
- `POST /api/thoughts` - Create new thought
- `GET /api/thoughts/:id` - Get specific thought
- `PUT /api/thoughts/:id` - Update thought
- `DELETE /api/thoughts/:id` - Delete thought
- `GET /api/thoughts/search?q=query` - Search thoughts
- `GET /api/thoughts/export` - Export all thoughts (JSON/CSV)

### Tags
- `GET /api/thoughts/tags` - Get all user's tags with counts
- `POST /api/thoughts/:id/tags` - Add tag to thought
- `DELETE /api/thoughts/:id/tags/:tag` - Remove tag from thought
- `GET /api/thoughts/tags/:tag` - Get thoughts by tag

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/aurora_thoughts
REDIS_URL=redis://localhost:6379
IDENTITY_SERVICE_URL=http://identity:5000
PORT=4001
NODE_ENV=development
```

## Why MongoDB?

**Perfect fit for Thoughts service:**
- ✅ **High write volume** - Quick capture means lots of writes
- ✅ **Simple documents** - Each thought is independent
- ✅ **No joins needed** - Thoughts don't relate to other thoughts
- ✅ **Flexible schema** - Easy to add metadata fields later
- ✅ **Fast reads** - Simple queries by user + date
- ✅ **Built-in full-text search** - MongoDB text indexes work great
- ✅ **Horizontal scaling** - Can shard by userId easily

## Events Published

- `ThoughtCreated` - { id, user_id, text, timestamp }
- `ThoughtUpdated` - { id, user_id, text, timestamp }
- `ThoughtDeleted` - { id, user_id }
- `ThoughtTagged` - { thought_id, tag }

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

