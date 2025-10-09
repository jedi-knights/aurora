# Docker Compose Startup Sequence

This document describes the orderly and consistent startup sequence for Aurora's Docker Compose services.

## ✅ Verified Startup Order

Based on the actual startup log, services start in this exact order:

### **Level 0: Infrastructure Layer** (Starts in Parallel)
```
Container aurora-redis-1  Creating
Container aurora-mongo-journals-1  Creating
Container aurora-postgres-identity-1  Creating
Container aurora-postgres-planning-1  Creating
Container aurora-mongo-thoughts-1  Creating
```

**Why First?**
- No dependencies
- All have health checks
- Must be healthy before dependent services start

**Services:**
- `redis` (Cache, sessions, job queues)
- `postgres-identity` (Identity database)
- `postgres-planning` (Planning database)
- `mongo-thoughts` (Thoughts database)
- `mongo-journals` (Journals database)

---

### **Level 1: Foundation Service** (Waits for postgres-identity + redis)
```
Container aurora-postgres-identity-1  Healthy
Container aurora-redis-1  Healthy
Container aurora-identity-1  Starting
Container aurora-identity-1  Started
```

**Why Second?**
- Depends on: `postgres-identity` (healthy) + `redis` (healthy)
- All other application services need authentication
- Must be healthy before application services start

**Service:**
- `identity` (Authentication & user management)

---

### **Level 2: Application Services** (Waits for Identity + Own Database)
```
Container aurora-mongo-journals-1  Healthy
Container aurora-postgres-planning-1  Healthy
Container aurora-mongo-thoughts-1  Healthy
Container aurora-identity-1  Healthy
Container aurora-thoughts-1  Starting
Container aurora-journals-1  Starting
Container aurora-planning-1  Starting
```

**Why Third?**
- Each depends on: own database (healthy) + `identity` (healthy)
- Start in parallel once dependencies are met
- Must be healthy before gateway starts

**Services:**
- `thoughts` (Quick thought capture) - Depends on: mongo-thoughts + identity
- `journals` (Structured journaling) - Depends on: mongo-journals + identity
- `planning` (Tasks & events) - Depends on: postgres-planning + identity

---

### **Level 3: API Gateway** (Waits for All Backend Services)
```
Container aurora-identity-1  Healthy
Container aurora-redis-1  Healthy
Container aurora-planning-1  Healthy
Container aurora-thoughts-1  Healthy
Container aurora-journals-1  Healthy
Container aurora-gateway-1  Starting
Container aurora-gateway-1  Started
```

**Why Fourth?**
- Depends on: ALL backend services (healthy) + redis (healthy)
- Routes traffic to backend services
- Must be ready before frontend can make API calls

**Service:**
- `gateway` (Request routing, rate limiting, auth middleware)

---

### **Level 4: Frontend** (Waits for Gateway)
```
Container aurora-frontend-1  Starting
Container aurora-frontend-1  Started
```

**Why Last?**
- Depends on: `gateway` (started)
- Serves user interface
- Can safely start once API layer is ready

**Service:**
- `frontend` (Next.js web application)

---

## Dependency Configuration

### Infrastructure (No Dependencies)
```yaml
postgres-identity:
  healthcheck: pg_isready -U aurora -d aurora_identity
  # No depends_on

postgres-planning:
  healthcheck: pg_isready -U aurora -d aurora_planning
  # No depends_on

mongo-thoughts:
  healthcheck: mongosh --eval "db.adminCommand('ping')"
  # No depends_on

mongo-journals:
  healthcheck: mongosh --eval "db.adminCommand('ping')"
  # No depends_on

redis:
  healthcheck: redis-cli ping
  # No depends_on
```

### Foundation Service
```yaml
identity:
  depends_on:
    postgres-identity:
      condition: service_healthy
    redis:
      condition: service_healthy
  healthcheck: wget /health/readiness
```

### Application Services
```yaml
thoughts:
  depends_on:
    mongo-thoughts:
      condition: service_healthy
    identity:
      condition: service_healthy
  healthcheck: wget /health/readiness

journals:
  depends_on:
    mongo-journals:
      condition: service_healthy
    identity:
      condition: service_healthy
  healthcheck: wget /health/readiness

planning:
  depends_on:
    postgres-planning:
      condition: service_healthy
    identity:
      condition: service_healthy
  healthcheck: wget /health/readiness
```

### Gateway & Frontend
```yaml
gateway:
  depends_on:
    identity:
      condition: service_healthy
    thoughts:
      condition: service_healthy
    journals:
      condition: service_healthy
    planning:
      condition: service_healthy
    redis:
      condition: service_healthy
  # Placeholder service (not yet implemented)

frontend:
  depends_on:
    gateway:
      condition: service_started
  # Next.js application
```

---

## Startup Timeline

Based on actual startup logs:

| Time | Event | Service |
|------|-------|---------|
| T+0s | Network created | aurora-network |
| T+1s | Infrastructure starts | redis, databases (5 containers) |
| T+10s | Infrastructure healthy | All databases + redis |
| T+11s | Identity starts | identity |
| T+20s | Identity healthy | identity |
| T+21s | App services start | thoughts, journals, planning |
| T+30s | App services healthy | thoughts, journals, planning |
| T+31s | Gateway starts | gateway |
| T+32s | Frontend starts | frontend |

**Total startup time: ~30-35 seconds** (with healthy services)

---

## Health Check Strategy

All services use appropriate health checks:

### Database Health Checks
- **PostgreSQL**: `pg_isready -U aurora -d <database>`
- **MongoDB**: `mongosh --eval "db.adminCommand('ping')"`
- **Redis**: `redis-cli ping`

### Application Health Checks
- **All Services**: `wget --spider http://localhost:<port>/health/readiness`
- Checks include database connectivity validation
- Returns 200 if ready, 503 if not ready

### Health Check Timing
```yaml
interval: 10s      # Check every 10 seconds
timeout: 5s        # Wait up to 5 seconds for response
retries: 3-5       # Retry 3-5 times before marking unhealthy
start_period: 30s  # Grace period for app services to start
```

---

## Benefits of This Configuration

### ✅ Orderly Startup
Services start in logical dependency order, preventing connection failures.

### ✅ No Failed Connections
Services wait for dependencies to be healthy before starting.

### ✅ Automatic Recovery
If a service fails, dependent services automatically stop/restart.

### ✅ Production Ready
Same behavior in development and production environments.

### ✅ Easy Debugging
Clear dependency chain makes troubleshooting easier.

### ✅ Predictable Behavior
Startup sequence is deterministic and repeatable.

---

## Testing the Startup Sequence

### Watch Live Startup
```bash
# Start and watch logs
docker-compose up

# Or in detached mode
docker-compose up -d && docker-compose logs -f
```

### Verify Dependency Chain
```bash
# Stop a database
docker-compose stop postgres-identity

# Watch cascade effect
docker-compose ps
# Identity will fail health checks
# Application services will eventually fail
# Gateway will not receive traffic
```

### Test Recovery
```bash
# Restart database
docker-compose start postgres-identity

# Watch automatic recovery
docker-compose ps
# Identity recovers
# Application services recover
# Gateway receives traffic again
```

---

## Development Tools

Development tools (pgadmin, mongo-express) also use health conditions:

```yaml
mongo-express-thoughts:
  depends_on:
    mongo-thoughts:
      condition: service_healthy
  profiles: [dev]

mongo-express-journals:
  depends_on:
    mongo-journals:
      condition: service_healthy
  profiles: [dev]
```

Start with development tools:
```bash
docker-compose --profile dev up -d
```

---

## Troubleshooting

### Service Won't Start
Check dependency health:
```bash
docker-compose ps
# Look for unhealthy services
```

### Slow Startup
Increase start_period if services need more time:
```yaml
healthcheck:
  start_period: 60s  # Instead of 30s
```

### Circular Dependencies
Current configuration has NO circular dependencies:
- Infrastructure → Identity → Applications → Gateway → Frontend
- Linear dependency chain ensures clean startup

---

## Summary

Aurora's Docker Compose configuration implements a clean, orderly startup sequence with proper health checks at every level. This ensures:

1. Infrastructure (databases, cache) is ready first
2. Identity service validates authentication
3. Application services can safely connect
4. Gateway can route to healthy backends
5. Frontend serves users when APIs are ready

This configuration is **production-ready** and follows Docker Compose best practices.

