.PHONY: help up down build logs clean frontend-install backend-install install dev dev-frontend dev-backend db-migrate db-seed

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services with Docker Compose
	docker-compose up -d

up-dev: ## Start all services including development tools (pgadmin)
	docker-compose --profile dev up -d

down: ## Stop all services
	docker-compose down

down-volumes: ## Stop all services and remove volumes
	docker-compose down -v

build: ## Build all Docker images
	docker-compose build

logs: ## View logs from all services
	docker-compose logs -f

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-api: ## View API logs
	docker-compose logs -f api

logs-auth: ## View auth service logs
	docker-compose logs -f auth

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

frontend-install: ## Install frontend dependencies
	cd frontend && npm install

backend-install: ## Install backend dependencies (placeholder)
	@echo "Backend services not yet implemented"

install: frontend-install backend-install ## Install all dependencies

dev: ## Start development environment
	docker-compose up

dev-frontend: ## Start frontend in development mode
	cd frontend && npm run dev

dev-api: ## Start API service in development mode (placeholder)
	@echo "API service not yet implemented"

db-migrate: ## Run database migrations (placeholder)
	@echo "Database migrations not yet implemented"

db-seed: ## Seed database (placeholder)
	@echo "Database seeding not yet implemented"

ps: ## Show running containers
	docker-compose ps

restart: ## Restart all services
	docker-compose restart

restart-frontend: ## Restart frontend service
	docker-compose restart frontend

restart-api: ## Restart API service
	docker-compose restart api

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-api: ## Open shell in API container
	docker-compose exec api sh

shell-postgres: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U aurora -d aurora

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli

