# Getting Started with Aurora

This guide will help you set up the Aurora development environment.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Docker** (v20.0+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development without Docker
- **Make** (optional) - for convenient shortcuts

## Option 1: Quick Start with Docker (Recommended)

This is the fastest way to get everything running.

### 1. Start all services

```bash
# Using Make
make up

# Or using docker-compose directly
docker-compose up -d
```

This will start:
- **Frontend** on http://localhost:3000
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- API and Auth services (placeholders until implemented)

### 2. View logs

```bash
make logs              # All services
make logs-frontend     # Frontend only
```

### 3. Access the application

Open your browser and navigate to http://localhost:3000

### 4. Stop services

```bash
make down
```

## Option 2: Local Development (Frontend Only)

If you want to develop the frontend without Docker:

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run development server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

Note: Without the backend services running, the app will use browser localStorage for data.

## Option 3: Full Development Environment

For developing both frontend and backend services:

### 1. Start infrastructure services only

```bash
docker-compose up -d postgres redis
```

### 2. Run frontend locally

```bash
cd frontend
npm install
npm run dev
```

### 3. Run backend services locally (when implemented)

```bash
# In separate terminals:
cd services/api
npm install
npm run dev

cd services/auth
npm install
npm run dev
```

## Development Tools

### PGAdmin (Database Management)

Start with development profile to access PGAdmin:

```bash
make up-dev
# or
docker-compose --profile dev up -d
```

Access PGAdmin at http://localhost:5050
- **Email:** admin@aurora.local
- **Password:** admin

To connect to PostgreSQL in PGAdmin:
- **Host:** postgres
- **Port:** 5432
- **Database:** aurora
- **Username:** aurora
- **Password:** aurora_password

### Database Access

```bash
# PostgreSQL shell
make shell-postgres
# or
docker-compose exec postgres psql -U aurora -d aurora

# Redis CLI
make shell-redis
# or
docker-compose exec redis redis-cli
```

## Useful Commands

```bash
# View all available commands
make help

# Service management
make up                 # Start services
make down               # Stop services
make restart            # Restart all services
make restart-frontend   # Restart frontend only
make build              # Rebuild Docker images

# Logs
make logs               # All service logs
make logs-frontend      # Frontend logs only
make logs-api          # API logs only

# Container access
make shell-frontend     # Shell into frontend container
make shell-postgres     # PostgreSQL CLI
make shell-redis        # Redis CLI

# Database
make db-migrate         # Run migrations (when implemented)
make db-seed           # Seed database (when implemented)

# Cleanup
make down-volumes       # Stop and remove volumes (data loss!)
make clean             # Remove all containers, volumes, and images
```

## Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secret_key

# etc.
```

## Project Structure

```
aurora/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js App Router
│   ├── public/        # Static assets
│   └── Dockerfile     # Frontend container
│
├── services/          # Backend microservices
│   ├── api/          # Main API (to be implemented)
│   ├── auth/         # Authentication (to be implemented)
│   └── database/     # DB schemas and migrations
│
├── docker-compose.yml # Service orchestration
├── Makefile          # Development shortcuts
└── README.md         # Project overview
```

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3000  # or whatever port

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Build Errors

```bash
# Clean and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Docker Issues

```bash
# Clean up everything
make clean

# Or manually
docker-compose down -v
docker system prune -a
```

## Next Steps

1. ✅ Frontend is running - you can start using it immediately!
2. 📝 Implement API service in `services/api/`
3. 🔐 Implement Auth service in `services/auth/`
4. 🗄️ Create database migrations in `services/database/`
5. 🔗 Connect frontend to backend APIs

## Need Help?

- Check the [main README](./README.md) for architecture overview
- See service-specific READMEs:
  - [Frontend](./frontend/README.md)
  - [API Service](./services/api/README.md)
  - [Auth Service](./services/auth/README.md)
  - [Database](./services/database/README.md)

## Development Workflow

1. **Daily workflow:**
   ```bash
   make up              # Start services
   make logs-frontend   # Monitor logs
   # ... do your development ...
   make down            # Stop when done
   ```

2. **After pulling changes:**
   ```bash
   make down
   make build
   make up
   ```

3. **Clean slate:**
   ```bash
   make down-volumes    # ⚠️ Destroys data
   make up
   ```

Happy coding! 🚀

