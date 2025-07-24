#!/bin/bash

set -e

case "${1:-}" in
    up)
        test -f storage.json || echo "[]" > storage.json
        test -f .env || cp env.example .env
        docker compose up -d
        echo "Started: http://api.localhost (Dashboard: http://localhost:8080)"
        ;;
    down)
        docker compose down
        ;;
    logs)
        docker compose logs -f "${2:-}"
        ;;
    build)
        docker compose build --no-cache
        ;;
    clean)
        docker compose down -v
        docker system prune -f
        ;;
    *)
        echo "Usage: $0 {up|down|logs|build|clean}"
        exit 1
        ;;
esac 