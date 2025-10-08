# Search Service

Cross-domain search and discovery service.

## Bounded Context

Cross-Domain Search and Discovery

## Responsibilities

- Unified search across thoughts, journals, and tasks
- Search index management
- Search suggestions and autocomplete
- Recent searches tracking
- Search analytics

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express
- **Search Engine:** Elasticsearch or Meilisearch
- **Cache:** Redis
- **Message Queue:** RabbitMQ/Kafka (for index updates)

## Search Index Structure

### Unified Search Index
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "thought|journal|entry|task|event",
  "title": "string",
  "content": "string",
  "timestamp": "datetime",
  "tags": ["array", "of", "tags"],
  "metadata": {
    "journal_name": "string (for entries)",
    "completed": "boolean (for tasks)",
    "priority": "string (for tasks)"
  }
}
```

## API Endpoints

### Search
- `GET /api/search?q=query&types=thoughts,journals,tasks&limit=20` - Universal search
- `GET /api/search/suggestions?q=partial` - Autocomplete suggestions
- `GET /api/search/recent` - Get recent searches
- `DELETE /api/search/history` - Clear search history
- `POST /api/search/index/rebuild` - Rebuild search index (admin)

### Filters
- `&date_from=YYYY-MM-DD` - Filter by date range
- `&date_to=YYYY-MM-DD`
- `&tags=tag1,tag2` - Filter by tags
- `&completed=true|false` - Filter tasks by completion

## Environment Variables

```env
ELASTICSEARCH_URL=http://elasticsearch:9200
# or
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_KEY=your-master-key

REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
IDENTITY_SERVICE_URL=http://identity:5000
PORT=4004
NODE_ENV=development
```

## Events Consumed

### From Thoughts Service
- `ThoughtCreated` → Index new thought
- `ThoughtUpdated` → Update thought in index
- `ThoughtDeleted` → Remove from index

### From Journals Service
- `JournalCreated` → Index journal
- `EntryCreated` → Index entry
- `EntryUpdated` → Update entry
- `EntryDeleted` → Remove entry

### From Planning Service
- `TaskCreated` → Index task
- `TaskUpdated` → Update task
- `TaskDeleted` → Remove task

## Event Handler Pattern

```javascript
// Example event handler
eventBus.on('ThoughtCreated', async (event) => {
  const { id, user_id, text, timestamp, tags } = event.data
  
  await searchIndex.index({
    id,
    user_id,
    type: 'thought',
    content: text,
    timestamp,
    tags
  })
})
```

## Search Features

### Full-Text Search
- Search across all content
- Fuzzy matching
- Relevance scoring

### Faceted Search
- Filter by type (thoughts, journals, tasks)
- Filter by date range
- Filter by tags
- Filter by completion status

### Autocomplete
- Real-time suggestions
- Based on previous searches and content

### Search Analytics
- Most searched terms
- Search result click-through rates
- No-result queries

## Getting Started

```bash
npm install

# Start Elasticsearch/Meilisearch
docker-compose up -d elasticsearch

# Run service
npm run dev

# Rebuild index
npm run index:rebuild
```

## Performance Considerations

- Cache frequent searches in Redis
- Use pagination for large result sets
- Implement search result debouncing on frontend
- Index updates are asynchronous (eventual consistency)

