# Journals Service

Structured journal management service.

## Bounded Context

Structured Journal Management

## Responsibilities

- Create, read, update, delete journals
- Manage journal entries
- Journal sharing and permissions
- Journal templates
- Entry versioning
- Export journals (PDF, Markdown)

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express or NestJS
- **Database:** MongoDB (optimized for hierarchical document structure)
- **Storage:** S3/MinIO for attachments (optional)
- **ODM:** Mongoose

## Database Schema

### MongoDB Collection: journals

```javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,          // e.g., "#FF5733"
  icon: String,           // e.g., "📔"
  settings: {
    isArchived: Boolean,
    isPrivate: Boolean,
    defaultMood: String
  },
  sharedWith: [{
    userId: String,
    permission: String,  // 'read', 'write', 'admin'
    sharedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### MongoDB Collection: journal_entries

```javascript
{
  _id: ObjectId,
  journalId: String,      // References journal
  content: String,        // Entry text (can be long)
  timestamp: Date,        // When entry was written
  metadata: {
    mood: String,         // e.g., "happy", "sad", "neutral"
    weather: String,      // e.g., "sunny", "rainy"
    location: String,     // e.g., "Home", "Office"
    wordCount: Number,
    tags: [String]
  },
  versions: [{            // Entry version history
    content: String,
    version: Number,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
```javascript
// Journals indexes
db.journals.createIndex({ userId: 1 })
db.journals.createIndex({ userId: 1, "settings.isArchived": 1 })
db.journals.createIndex({ "sharedWith.userId": 1 })

// Entries indexes
db.journal_entries.createIndex({ journalId: 1, timestamp: -1 })
db.journal_entries.createIndex({ journalId: 1, "metadata.mood": 1 })
db.journal_entries.createIndex({ content: "text" })  // Full-text search
```

### Mongoose Schema Example
```javascript
const journalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: "#667eea" },
  icon: { type: String, default: "📔" },
  settings: {
    isArchived: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: true },
    defaultMood: String
  },
  sharedWith: [{
    userId: String,
    permission: { type: String, enum: ['read', 'write', 'admin'] },
    sharedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

const entrySchema = new mongoose.Schema({
  journalId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  metadata: {
    mood: String,
    weather: String,
    location: String,
    wordCount: Number,
    tags: [String]
  },
  versions: [{
    content: String,
    version: Number,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

entrySchema.index({ journalId: 1, timestamp: -1 })
entrySchema.index({ content: 'text' })
```

## API Endpoints

### Journals
- `GET /api/journals` - List user's journals
- `POST /api/journals` - Create new journal
- `GET /api/journals/:id` - Get journal details
- `PUT /api/journals/:id` - Update journal
- `DELETE /api/journals/:id` - Delete journal
- `PATCH /api/journals/:id/archive` - Archive/unarchive journal

### Entries
- `GET /api/journals/:id/entries` - List journal entries
- `POST /api/journals/:id/entries` - Create entry
- `GET /api/journals/:id/entries/:entryId` - Get entry
- `PUT /api/journals/:id/entries/:entryId` - Update entry
- `DELETE /api/journals/:id/entries/:entryId` - Delete entry
- `GET /api/journals/:id/entries/:entryId/versions` - Get entry history

### Sharing
- `POST /api/journals/:id/share` - Share journal with user
- `DELETE /api/journals/:id/share/:userId` - Revoke access
- `GET /api/journals/shared` - Get journals shared with me

### Export
- `GET /api/journals/:id/export?format=pdf` - Export as PDF
- `GET /api/journals/:id/export?format=markdown` - Export as Markdown

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/aurora_journals
REDIS_URL=redis://localhost:6379
IDENTITY_SERVICE_URL=http://identity:5000
S3_BUCKET=aurora-journal-attachments
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
PORT=4002
NODE_ENV=development
```

## Why MongoDB?

**Perfect fit for Journals service:**
- ✅ **Hierarchical structure** - Journal → Entries natural fit for documents
- ✅ **Flexible schema** - Different journal types can have different metadata
- ✅ **Entry versions** - Can embed version history in entry document
- ✅ **Nested data** - Metadata (mood, weather, location) as subdocuments
- ✅ **No complex joins** - Entries belong to one journal
- ✅ **Variable content length** - Entries can be short or very long
- ✅ **Easy to export** - JSON documents map directly to export formats

## Events Published

- `JournalCreated`
- `JournalUpdated`
- `JournalDeleted`
- `EntryCreated`
- `EntryUpdated`
- `EntryDeleted`
- `JournalShared`

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

