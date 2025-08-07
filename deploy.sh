#!/bin/bash

# Bare Count API - Enterprise Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs|build]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
    cp env.example .env
    echo -e "${RED}🔧 Please edit .env file with your configuration before running again!${NC}"
    exit 1
fi

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Wait for service to be ready
wait_for_ready() {
    local max_attempts=30
    local attempt=1
    
    log_info "Waiting for service to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T counter-api wget -q --spider http://localhost:3000/ready 2>/dev/null; then
            log_success "Service is ready! (${attempt}s)"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    log_error "Service failed to become ready within ${max_attempts} seconds"
    return 1
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Parse flags
CLEAN_BUILD=false
if [[ "$1" == "--clean" ]] || [[ "$2" == "--clean" ]]; then
    CLEAN_BUILD=true
    shift
fi

# Main commands
case "${1:-start}" in
    "build")
        log_info "Building Bare Count API containers..."
        if [ "$CLEAN_BUILD" = true ]; then
            docker compose build --no-cache --pull
        else
            docker compose build --no-cache
        fi
        log_success "Build completed!"
        ;;
        
    "start")
        log_info "Starting Bare Count API in production mode..."
        
        # Create necessary directories and storage file
        mkdir -p data
        if [ ! -f data/storage.json ]; then
            echo '{"visits":[],"actions":[]}' > data/storage.json
            log_info "Created initial storage.json"
        fi
        
        # Build only if needed or forced
        if [ "$CLEAN_BUILD" = true ]; then
            log_info "Clean build requested..."
            docker compose build --no-cache --pull
        elif [ ! "$(docker images -q counter-api 2> /dev/null)" ]; then
            log_info "No existing image found, building..."
            docker compose build
        else
            log_info "Using existing image (use --clean to rebuild)"
        fi
        
        # Start services
        docker compose up -d
        
        # Wait for readiness
        if wait_for_ready; then
            log_success "Bare Count API is now running!"
        else
            log_error "Deployment failed - service not ready"
            exit 1
        fi
        log_info "Available endpoints:"
        echo "  📊 API: https://$(grep API_DOMAIN .env | cut -d'=' -f2)"
        echo "  📈 Tracker: https://$(grep API_DOMAIN .env | cut -d'=' -f2)/tracker.js"
        echo "  🏥 Health: https://$(grep API_DOMAIN .env | cut -d'=' -f2)/health"

        log_warning "Make sure to point your domain DNS to this server!"
        ;;
        
    "stop")
        log_info "Stopping Bare Count API..."
        docker compose down
        log_success "Services stopped!"
        ;;
        
    "restart")
        log_info "Restarting Bare Count API..."
        docker compose restart counter-api
        log_success "Services restarted!"
        ;;
        
    "logs")
        log_info "Showing logs (Press Ctrl+C to exit)..."
        docker compose logs -f
        ;;
        
    "status")
        log_info "Service status:"
        docker compose ps
        ;;
        
    "update")
        log_info "Updating Bare Count API..."
        docker compose pull
        docker compose build
        docker compose up -d
        log_success "Update completed!"
        ;;
        
    "backup")
        log_info "Creating backup..."
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp data/storage.json "$BACKUP_DIR/"
        cp .env "$BACKUP_DIR/"
        log_success "Backup created in $BACKUP_DIR"
        ;;
        
    "ssl-info")
        log_info "SSL Certificate Information:"
        docker compose exec traefik ls -la /letsencrypt/
        ;;
        
    *)
        echo "Bare Count API - Enterprise Deployment"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build     - Build containers from scratch"
        echo "  start     - Start the application (default)"
        echo "  stop      - Stop the application"
        echo "  restart   - Restart the application"
        echo "  logs      - Show live logs"
        echo "  status    - Show service status"
        echo "  update    - Pull updates and restart"
        echo "  backup    - Create backup of data"
        echo "  ssl-info  - Show SSL certificate info"
        echo ""
        echo "Flags:"
        echo "  --clean   - Force clean build (no cache, pull base images)"
        echo ""
        echo "Configuration:"
        echo "  Edit .env file to configure domain, email, rate limits"
        echo ""
        ;;
esac