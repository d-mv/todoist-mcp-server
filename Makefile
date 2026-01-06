.PHONY: install dev build start test lint format fix docker-build docker-up docker-down docker-logs help

help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies (clean install)"
	@echo "  make dev           - Run development server locally"
	@echo "  make build         - Build the project"
	@echo "  make start         - Start the production server locally"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Lint code using Biome"
	@echo "  make format        - Format code using Biome"
	@echo "  make fix           - Fix linting and formatting issues using Biome"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-up     - Start Docker environment"
	@echo "  make docker-down   - Stop Docker environment"
	@echo "  make docker-logs   - Show Docker logs"

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

test:
	npm test -- --run

lint:
	npm run lint

format:
	npm run format

fix:
	npm run fix

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f
