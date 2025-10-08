# Journals Service - Quick Start

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd services/journals
npm install
```

### 2. Start MongoDB
```bash
# Make sure mongo-journals container is running
docker-compose up -d mongo-journals

# Check it's running
docker-compose ps mongo-journals
```

### 3. Start Service
```bash
npm run dev
```

Service will run on http://localhost:4002

## Test It (Requires Identity Service Running)

### 1. Get an auth token

```bash
# Login to get token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Copy the accessToken
TOKEN="your-token-here"
```

### 2. Test Journal Endpoints

```bash
# Create a journal
curl -X POST http://localhost:4002/api/journals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Daily Journal",
    "description": "Personal thoughts and reflections",
    "color": "#667eea",
    "icon": "📔"
  }'

# Save the journal ID from response
JOURNAL_ID="journal-id-here"

# Get all journals
curl -X GET http://localhost:4002/api/journals \
  -H "Authorization: Bearer $TOKEN"

# Get specific journal
curl -X GET http://localhost:4002/api/journals/$JOURNAL_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Entry Endpoints

```bash
# Create an entry
curl -X POST http://localhost:4002/api/journals/$JOURNAL_ID/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Today was a great day! I accomplished so much.",
    "metadata": {
      "mood": "happy",
      "weather": "sunny",
      "location": "Home"
    }
  }'

# Save the entry ID
ENTRY_ID="entry-id-here"

# Get all entries for journal
curl -X GET http://localhost:4002/api/journals/$JOURNAL_ID/entries \
  -H "Authorization: Bearer $TOKEN"

# Get specific entry
curl -X GET http://localhost:4002/api/journals/$JOURNAL_ID/entries/$ENTRY_ID \
  -H "Authorization: Bearer $TOKEN"

# Update entry
curl -X PUT http://localhost:4002/api/journals/$JOURNAL_ID/entries/$ENTRY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Updated: Today was an AMAZING day!",
    "metadata": {
      "mood": "ecstatic"
    }
  }'

# Delete entry
curl -X DELETE http://localhost:4002/api/journals/$JOURNAL_ID/entries/$ENTRY_ID \
  -H "Authorization: Bearer $TOKEN"
```

## What's Implemented

✅ Journal entity with validation
✅ Entry entity with validation
✅ MongoDB repositories (2)
✅ Create journal
✅ Get journal(s) with entry counts
✅ Update journal
✅ Delete journal (cascades to entries)
✅ Create entry (validates journal ownership)
✅ Get entry/entries
✅ Update entry
✅ Delete entry
✅ Hexagonal architecture
✅ SOLID/DRY/CLEAN code
✅ Cyclomatic complexity ≤ 7

## API Endpoints

### Journals
- `POST /api/journals` - Create journal
- `GET /api/journals` - Get all journals with entry counts
- `GET /api/journals/:id` - Get specific journal
- `PUT /api/journals/:id` - Update journal
- `DELETE /api/journals/:id` - Delete journal (and all entries)

### Entries
- `POST /api/journals/:journalId/entries` - Create entry
- `GET /api/journals/:journalId/entries` - Get all entries
- `GET /api/journals/:journalId/entries/:entryId` - Get specific entry
- `PUT /api/journals/:journalId/entries/:entryId` - Update entry
- `DELETE /api/journals/:journalId/entries/:entryId` - Delete entry

## Working Service! 🎉

Three services working now:
- ✅ Identity Service
- ✅ Thoughts Service  
- ✅ Journals Service

60% complete! Two services to go! 💪

