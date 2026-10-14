#!/bin/bash

# AI Persistence Package - Production Deployment Script
# Complete deployment with Docker, monitoring, and security

set -e

echo "🚀 Deploying AI Persistence Package to Production..."

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating environment file..."
    cat > .env << EOF
# AI Persistence Package - Production Environment
NODE_ENV=production
H2GNN_STORAGE_PATH=/app/persistence
H2GNN_STATE_FILE=/app/state/state.json
H2GNN_LOG_LEVEL=info
H2GNN_MAX_MEMORIES=10000
H2GNN_CONSOLIDATION_THRESHOLD=100

# Security
H2GNN_ENCRYPTION_KEY=$(openssl rand -hex 32)
H2GNN_AUTH_TOKEN=$(openssl rand -hex 32)

# Database
POSTGRES_USER=ai_persistence
POSTGRES_PASSWORD=$(openssl rand -hex 16)
REDIS_PASSWORD=$(openssl rand -hex 16)

# Monitoring
GRAFANA_PASSWORD=$(openssl rand -hex 16)

# SSL (for production)
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
EOF
    print_success "Environment file created with secure random passwords"
fi

# Load environment variables
source .env

# Create SSL directory and self-signed certificate for development
if [ ! -d ssl ]; then
    print_status "Creating SSL certificates for development..."
    mkdir -p ssl
    
    # Generate self-signed certificate
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=ai-persistence.localhost"
    
    print_success "SSL certificates created"
fi

# Build the application
print_status "Building AI Persistence Package..."
./build-production.sh

# Build Docker images
print_status "Building Docker images..."
docker-compose build --no-cache

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check AI Persistence service
if docker-compose ps ai-persistence | grep -q "Up"; then
    print_success "AI Persistence service is running"
else
    print_error "AI Persistence service failed to start"
    docker-compose logs ai-persistence
    exit 1
fi

# Check Redis
if docker-compose ps redis | grep -q "Up"; then
    print_success "Redis service is running"
else
    print_error "Redis service failed to start"
    docker-compose logs redis
    exit 1
fi

# Check PostgreSQL
if docker-compose ps postgres | grep -q "Up"; then
    print_success "PostgreSQL service is running"
else
    print_error "PostgreSQL service failed to start"
    docker-compose logs postgres
    exit 1
fi

# Check Nginx
if docker-compose ps nginx | grep -q "Up"; then
    print_success "Nginx service is running"
else
    print_error "Nginx service failed to start"
    docker-compose logs nginx
    exit 1
fi

# Check Prometheus
if docker-compose ps prometheus | grep -q "Up"; then
    print_success "Prometheus service is running"
else
    print_error "Prometheus service failed to start"
    docker-compose logs prometheus
    exit 1
fi

# Check Grafana
if docker-compose ps grafana | grep -q "Up"; then
    print_success "Grafana service is running"
else
    print_error "Grafana service failed to start"
    docker-compose logs grafana
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Health endpoint is responding"
else
    print_warning "Health endpoint is not responding"
fi

# Test API endpoint
if curl -f http://localhost/api/status > /dev/null 2>&1; then
    print_success "API endpoint is responding"
else
    print_warning "API endpoint is not responding"
fi

# Display deployment summary
echo ""
print_success "🎉 AI Persistence Package Deployment Complete!"
echo ""
echo "📊 Deployment Summary:"
echo "  ✅ AI Persistence Core: RUNNING"
echo "  ✅ Redis Database: RUNNING"
echo "  ✅ PostgreSQL Database: RUNNING"
echo "  ✅ Nginx Reverse Proxy: RUNNING"
echo "  ✅ Prometheus Monitoring: RUNNING"
echo "  ✅ Grafana Visualization: RUNNING"
echo ""
echo "🌐 Service URLs:"
echo "  🔗 AI Persistence API: http://localhost/api"
echo "  🔗 Admin Interface: http://localhost/admin"
echo "  🔗 Health Check: http://localhost/health"
echo "  🔗 Prometheus: http://localhost:9090"
echo "  🔗 Grafana: http://localhost:3001"
echo ""
echo "🔐 Security Information:"
echo "  🔑 Encryption Key: ${H2GNN_ENCRYPTION_KEY:0:16}..."
echo "  🔑 Auth Token: ${H2GNN_AUTH_TOKEN:0:16}..."
echo "  🔑 Redis Password: ${REDIS_PASSWORD:0:16}..."
echo "  🔑 PostgreSQL Password: ${POSTGRES_PASSWORD:0:16}..."
echo "  🔑 Grafana Password: ${GRAFANA_PASSWORD:0:16}..."
echo ""
echo "📝 Useful Commands:"
echo "  📋 View logs: docker-compose logs -f"
echo "  📋 View specific service logs: docker-compose logs -f ai-persistence"
echo "  📋 Stop services: docker-compose down"
echo "  📋 Restart services: docker-compose restart"
echo "  📋 Update services: docker-compose pull && docker-compose up -d"
echo ""
echo "🚀 AI Persistence Package is ready for production use!"
