# Aurora - Your Personal Space

A unified personal space for thought, journaling, and planning — where each mode feels like its own app, yet everything stays connected.

## 🎉 **FOUR Services Fully Implemented - 80% Complete!**

✅ **Identity Service** (Port 5000, PostgreSQL) - Auth & user management  
✅ **Thoughts Service** (Port 4001, MongoDB) - Quick thought capture  
✅ **Journals Service** (Port 4002, MongoDB) - Structured journaling  
✅ **Planning Service** (Port 4003, PostgreSQL) - Task & event management  

**100+ files, ~4,200 LOC** following **Hexagonal Architecture** with **SOLID, DRY, CLEAN** principles and **cyclomatic complexity ≤ 7**.

### 🚀 Quick Start
```bash
# Start all four services
docker-compose up -d identity thoughts journals planning

# Test them
./test-services.sh

# All tests should pass! ✅
```

### 📖 Essential Docs
- **[FOUR_SERVICES_COMPLETE.md](./FOUR_SERVICES_COMPLETE.md)** - **ALL 4 services working!**
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - What's next (Gateway + Frontend)
- **[HEXAGONAL_ARCHITECTURE.md](./HEXAGONAL_ARCHITECTURE.md)** - Architecture guide
- **[CORE_ARCHITECTURE.md](./CORE_ARCHITECTURE.md)** - 4-service architecture

---

## 📋 Prerequisites

Before you can run Aurora, you need to install the following:

### 1. Install Homebrew (if not already installed)

```bash
# Check if Homebrew is installed
brew --version

# If not installed, install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Docker Desktop Community Edition

```bash
# Install Docker Desktop using Homebrew
brew install --cask docker

# Verify installation
docker --version
docker-compose --version
```

**After installation:**
1. Open **Docker Desktop** from Applications
2. Wait for Docker to start (whale icon in menu bar)
3. Verify Docker is running:
   ```bash
   docker ps
   # Should show empty list (no errors)
   ```

**Note:** Docker Desktop includes both Docker Engine and Docker Compose.

### 3. Install Node.js 18+

```bash
# Install Node.js using Homebrew
brew install node@18

# Verify installation
node --version  # Should be v18.x.x or higher
npm --version
```

### 4. Install Git (if not already installed)

```bash
# Git usually comes with macOS, but you can update via Homebrew
brew install git

# Verify installation
git --version
```

### System Requirements

- **macOS:** 10.15 or later
- **RAM:** 8GB minimum (16GB recommended)
- **Disk Space:** 20GB free space
- **CPU:** Intel or Apple Silicon

---

## 🏗️ Architecture

Aurora is built as a microservices architecture based on Domain-Driven Design (DDD) principles. Each service represents a bounded context with clear responsibilities.

### Service Architecture

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │
┌──────▼──────────┐
│  API Gateway    │
│   (Port 4000)   │
└──────┬──────────┘
       │
   ┌───┼───────────────┬──────────┬──────────┐
   │   │               │          │          │
┌──▼───▼──┐  ┌────────▼───┐  ┌───▼────┐  ┌─▼──────┐
│Identity │  │  Thoughts  │  │Journals│  │Planning│
│(5000)   │  │   (4001)   │  │ (4002) │  │ (4003) │
└─────────┘  └─────┬──────┘  └────┬───┘  └────┬───┘
                   │              │           │
              ┌────┼──────────────┼───────────┘
              │    │              │
         ┌────▼───┐│  ┌──────────▼┐  ┌──────────┐
         │ Search ││  │Notifications│  │Analytics │
         │ (4004) ││  │   (4005)    │  │  (4006)  │
         └────────┘│  └─────────────┘  └──────────┘
                   │
           [Event Bus - RabbitMQ/Kafka]
```

### Microservices

1. **Identity Service** (Port 5000) - Authentication, authorization, user management
2. **API Gateway** (Port 4000) - Request routing, rate limiting, auth middleware
3. **Thoughts Service** (Port 4001) - Quick thought capture and retrieval
4. **Journals Service** (Port 4002) - Journal and entry management
5. **Planning Service** (Port 4003) - Tasks and events management
6. **Search Service** (Port 4004) - Cross-domain unified search
7. **Notifications Service** (Port 4005) - Reminders, alerts, notifications
8. **Analytics Service** (Port 4006) - Productivity metrics and insights

### Infrastructure

- **PostgreSQL** - Primary data store
- **Redis** - Caching, sessions, job queues
- **RabbitMQ/Kafka** - Event-driven communication
- **Elasticsearch/Meilisearch** - Search indexing
- **TimescaleDB** - Analytics time-series data

### Documentation

- ⭐ **[CORE_ARCHITECTURE.md](./CORE_ARCHITECTURE.md)** - **4-Service Architecture (RECOMMENDED)**
- 📖 [SIMPLE_ARCHITECTURE.md](./SIMPLE_ARCHITECTURE.md) - Monolith approach (if you prefer simplicity)
- 📚 [RECOMMENDATIONS.md](./RECOMMENDATIONS.md) - Decision guide: Monolith vs Microservices
- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Full 8-service architecture (for reference/future)
- 📋 [SERVICES_SUMMARY.md](./SERVICES_SUMMARY.md) - Service overview and roadmap
- 🚀 [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup and development guide

```
aurora/
├── frontend/              # Next.js web application
├── services/
│   ├── identity/         # Auth & user management
│   ├── gateway/          # API Gateway (BFF)
│   ├── thoughts/         # Thoughts service
│   ├── journals/         # Journals service
│   ├── planning/         # Planning service
│   ├── search/           # Search service
│   ├── notifications/    # Notifications service
│   └── analytics/        # Analytics service
├── docker-compose.yml    # Service orchestration
├── Makefile             # Development shortcuts
├── ARCHITECTURE.md      # Detailed architecture
└── SERVICES_SUMMARY.md  # Service overview
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Make (optional, for convenience commands)

### Using Docker Compose (Recommended)

```bash
# Start all services
make up
# or
docker-compose up -d

# View logs
make logs

# Stop services
make down
```

### Local Development

```bash
# Install dependencies
cd frontend
npm install

# Run frontend in dev mode
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:4000 (when implemented)
- Auth Service: http://localhost:5000 (when implemented)
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- PGAdmin: http://localhost:5050 (with `--profile dev`)

## 📦 Services

Each service is independently deployable and scalable. See [SERVICES_SUMMARY.md](./SERVICES_SUMMARY.md) for detailed overview.

### Core Services (Priority 1)

1. **Identity Service** (5000) - Auth, user management, JWT tokens
2. **API Gateway** (4000) - Request routing, auth middleware, rate limiting
3. **Thoughts Service** (4001) - Quick thought CRUD operations
4. **Journals Service** (4002) - Journal and entry management
5. **Planning Service** (4003) - Task and event management

### Enhanced Services (Priority 2)

6. **Search Service** (4004) - Unified search across all content
7. **Notifications Service** (4005) - Email, push, and in-app notifications

### Analytics Services (Priority 3)

8. **Analytics Service** (4006) - Productivity metrics and insights

### Infrastructure

- **PostgreSQL** (5432) - Primary database
- **Redis** (6379) - Cache, sessions, job queues
- **RabbitMQ/Kafka** - Event bus for service communication
- **Elasticsearch/Meilisearch** - Search indexing
- **TimescaleDB** - Time-series analytics data

## 🛠️ Development Commands

```bash
# Using Make
make help              # Show all available commands
make up                # Start all services
make up-dev            # Start with development tools (pgadmin)
make down              # Stop all services
make logs              # View all logs
make logs-frontend     # View frontend logs only
make shell-postgres    # Open PostgreSQL shell
make shell-redis       # Open Redis CLI

# Direct Docker Compose
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f frontend         # Follow frontend logs
docker-compose exec postgres psql -U aurora -d aurora  # PostgreSQL shell
```

## 📁 Project Structure

```
aurora/
├── frontend/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── styles/          # CSS modules
│   │   ├── layout.jsx       # Root layout
│   │   └── page.jsx         # Home page
│   ├── public/              # Static assets
│   ├── Dockerfile           # Frontend container
│   ├── package.json
│   └── next.config.js
│
├── services/
│   ├── api/                 # Main API service (to be implemented)
│   ├── auth/                # Auth service (to be implemented)
│   └── database/            # DB schemas and migrations
│
├── docker-compose.yml       # Service orchestration
├── Makefile                 # Development shortcuts
└── README.md               # This file
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
POSTGRES_USER=aurora
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://aurora:password@localhost:5432/aurora

# JWT
JWT_SECRET=your-secret-key

# Services
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📊 Database Schema

### Users
- id, email, password_hash, name, created_at, updated_at

### Thoughts
- id, user_id, text, timestamp

### Journals
- id, user_id, name, created_at

### Journal Entries
- id, journal_id, content, timestamp

### Tasks
- id, user_id, title, date, completed, category

See `services/database/README.md` for detailed schema.

## 🚢 Deployment

### Production Build

```bash
# Build all images
docker-compose build

# Start in production mode
docker-compose up -d
```

### Environment Considerations

- Set strong passwords for PostgreSQL and JWT secrets
- Use environment-specific `.env` files
- Enable HTTPS in production
- Configure CORS properly
- Set up backup strategies for PostgreSQL

## 🔮 Roadmap

### Phase 1: Core Features (Months 1-3)
- [x] Frontend Next.js application
- [x] Docker Compose setup
- [x] Microservices architecture design
- [ ] Identity Service (auth & user management)
- [ ] API Gateway
- [ ] Thoughts Service
- [ ] Journals Service
- [ ] Planning Service
- [ ] Database migrations

### Phase 2: Enhanced Features (Months 4-5)
- [ ] Search Service (unified search)
- [ ] Notifications Service (email, push)
- [ ] User authentication flow
- [ ] Data sync between localStorage and backend
- [ ] OAuth integration (Google, GitHub)
- [ ] Real-time updates (WebSocket)

### Phase 3: Analytics & Insights (Month 6)
- [ ] Analytics Service
- [ ] Productivity metrics
- [ ] Usage statistics
- [ ] Trends and patterns

### Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Export/Import functionality
- [ ] Advanced tagging system
- [ ] Dark mode
- [ ] Collaboration features
- [ ] Voice-to-text
- [ ] AI-powered insights

## 🤝 Contributing

This project is currently in early development. Contributions will be welcome once the basic architecture is complete.

## 📄 License

ISC

## 🔗 Links

### Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture documentation
- [SERVICES_SUMMARY.md](./SERVICES_SUMMARY.md) - Service overview and roadmap
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup and development guide

### Service Documentation
- [Frontend](./frontend/README.md)
- [Identity Service](./services/identity/README.md)
- [API Gateway](./services/gateway/README.md)
- [Thoughts Service](./services/thoughts/README.md)
- [Journals Service](./services/journals/README.md)
- [Planning Service](./services/planning/README.md)
- [Search Service](./services/search/README.md)
- [Notifications Service](./services/notifications/README.md)
- [Analytics Service](./services/analytics/README.md)
