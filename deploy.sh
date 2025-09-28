#!/bin/bash

# =============================================================================
# API Starter Deployment Script
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your configuration before deploying!"
            exit 1
        else
            print_error ".env.example file not found. Please create environment configuration."
            exit 1
        fi
    fi
}

# Function to deploy development environment
deploy_dev() {
    print_status "Deploying development environment..."
    check_env_file

    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

    print_success "Development environment deployed!"
    print_status "Services available at:"
    echo "  - API: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
    echo "  - Redis: localhost:6379"
    echo "  - MongoDB: localhost:27017"
}

# Function to deploy production environment
deploy_prod() {
    print_status "Deploying production environment..."
    check_env_file

    # Check for required environment variables
    source .env
    if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "your_super_secret_key_here_change_this_in_production" ]; then
        print_error "Please set a secure SECRET_KEY in .env file for production!"
        exit 1
    fi

    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

    print_success "Production environment deployed!"
    print_status "Services running in production mode"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped!"
}

# Function to view logs
view_logs() {
    service=${1:-""}
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed!"
}

# Main script logic
case "$1" in
    "dev"|"development")
        deploy_dev
        ;;
    "prod"|"production")
        deploy_prod
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        view_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {dev|prod|stop|logs|status|cleanup}"
        echo ""
        echo "Commands:"
        echo "  dev        - Deploy development environment"
        echo "  prod       - Deploy production environment"
        echo "  stop       - Stop all services"
        echo "  logs       - View logs (optionally specify service)"
        echo "  status     - Show service status"
        echo "  cleanup    - Clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 dev"
        echo "  $0 prod"
        echo "  $0 logs api"
        echo "  $0 logs workers"
        exit 1
        ;;
esac