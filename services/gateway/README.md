# API Gateway (BFF)

Backend for Frontend - API Gateway and request routing.

## Purpose

Single entry point for frontend to interact with all microservices.

## Responsibilities

- Request routing to appropriate microservices
- Authentication middleware (JWT validation)
- Rate limiting per user
- API versioning
- Request/response transformation
- Response aggregation from multiple services
- Caching frequent requests
- CORS configuration
- Request logging and monitoring

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express or Fastify
- **Proxy:** http-proxy-middleware
- **Cache:** Redis
- **Alternative:** Kong, Nginx, or Traefik

## Architecture

```
Frontend → API Gateway → Microservices
            ↓
         [Auth Check]
         [Rate Limit]
         [Cache Check]
         [Route]
```

## Routing Configuration

```javascript
const routes = {
  '/auth/*': 'http://identity:5000',
  '/api/thoughts/*': 'http://thoughts:4001',
  '/api/journals/*': 'http://journals:4002',
  '/api/planning/*': 'http://planning:4003',
  '/api/search/*': 'http://search:4004',
  '/api/notifications/*': 'http://notifications:4005',
  '/api/analytics/*': 'http://analytics:4006'
}
```

## Middleware Pipeline

### 1. CORS
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

### 2. Rate Limiting
```javascript
const rateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  store: new RedisStore({ client: redis })
})
```

### 3. Authentication
```javascript
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### 4. Request Logging
```javascript
app.use(morgan('combined'))
app.use(requestLogger)
```

### 5. Cache Layer
```javascript
const cacheMiddleware = async (req, res, next) => {
  if (req.method !== 'GET') return next()
  
  const key = `cache:${req.path}:${req.user.id}`
  const cached = await redis.get(key)
  
  if (cached) {
    return res.json(JSON.parse(cached))
  }
  
  res.sendResponse = res.json
  res.json = (data) => {
    redis.setex(key, 300, JSON.stringify(data)) // 5 min cache
    res.sendResponse(data)
  }
  
  next()
}
```

## API Aggregation

### Dashboard Endpoint
Aggregates data from multiple services:

```javascript
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  const userId = req.user.id
  
  const [thoughts, journals, tasks, analytics] = await Promise.all([
    axios.get(`http://thoughts:4001/api/thoughts/recent?user_id=${userId}`),
    axios.get(`http://journals:4002/api/journals/recent?user_id=${userId}`),
    axios.get(`http://planning:4003/api/tasks/today?user_id=${userId}`),
    axios.get(`http://analytics:4006/api/analytics/summary?user_id=${userId}`)
  ])
  
  res.json({
    thoughts: thoughts.data,
    journals: journals.data,
    tasks: tasks.data,
    analytics: analytics.data
  })
})
```

## Environment Variables

```env
# Services
IDENTITY_SERVICE_URL=http://identity:5000
THOUGHTS_SERVICE_URL=http://thoughts:4001
JOURNALS_SERVICE_URL=http://journals:4002
PLANNING_SERVICE_URL=http://planning:4003
SEARCH_SERVICE_URL=http://search:4004
NOTIFICATIONS_SERVICE_URL=http://notifications:4005
ANALYTICS_SERVICE_URL=http://analytics:4006

# Frontend
FRONTEND_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Server
PORT=4000
NODE_ENV=development
```

## API Versioning

Support multiple API versions:

```javascript
app.use('/api/v1', v1Routes)
app.use('/api/v2', v2Routes)
```

## Health Check

```javascript
app.get('/health', async (req, res) => {
  const services = await checkServiceHealth()
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services
  })
})
```

## Error Handling

```javascript
app.use((err, req, res, next) => {
  logger.error(err)
  
  if (err.response) {
    // Error from downstream service
    return res.status(err.response.status).json(err.response.data)
  }
  
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  })
})
```

## Circuit Breaker

Prevent cascading failures:

```javascript
const circuitBreaker = require('opossum')

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
}

const breaker = new circuitBreaker(fetchFromService, options)
```

## Getting Started

```bash
npm install
npm run dev
```

## Monitoring

- Request metrics: `/metrics`
- Health check: `/health`
- Service status: `/status`

## Alternative: Kong API Gateway

If you prefer a dedicated API gateway:

```yaml
# kong.yml
_format_version: "2.1"

services:
  - name: identity-service
    url: http://identity:5000
    routes:
      - name: auth-route
        paths:
          - /auth

  - name: thoughts-service
    url: http://thoughts:4001
    routes:
      - name: thoughts-route
        paths:
          - /api/thoughts

plugins:
  - name: rate-limiting
    config:
      minute: 100
  - name: jwt
  - name: cors
```

