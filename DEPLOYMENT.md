# Deployment Guide

This guide covers deploying your FastAPI application with background workers using Docker.

## Architecture Overview

Your application uses a **single Docker image** for both the API server and background workers, but runs them as **separate services** with different commands:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   API       │    │  Workers    │    │   Redis     │
│ (Same Image)│◄──►│(Same Image) │◄──►│ (Message    │
│             │    │             │    │  Broker)    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                      ▲
       ▼                                      │
┌─────────────┐                              │
│  MongoDB    │◄─────────────────────────────┘
│ (Database)  │
└─────────────┘
```

## Quick Start

### 1. Clone and Configure

```bash
cd api_starter
cp .env.example .env
# Edit .env with your configuration
```

### 2. Deploy Development Environment

```bash
./deploy.sh dev
```

### 3. Deploy Production Environment

```bash
./deploy.sh prod
```

## Deployment Options

### Development Deployment

**Features:**
- Hot reload for code changes
- Direct port access to all services
- Volume mounts for live development
- Simplified configuration

**Command:**
```bash
# Using deployment script
./deploy.sh dev

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**Available Services:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Redis: localhost:6379
- MongoDB: localhost:27017

### Production Deployment

**Features:**
- Multiple replicas for high availability
- Resource limits and reservations
- Nginx reverse proxy with rate limiting
- Security headers and SSL support
- Optimized worker configuration

**Command:**
```bash
# Using deployment script
./deploy.sh prod

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Service Details

### API Service
- **Purpose**: Handles HTTP requests
- **Image**: Built from `backend/Dockerfile`
- **Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Production Replicas**: 2
- **Health Check**: `/health` endpoint

### Workers Service
- **Purpose**: Processes background tasks (emails, cleanup, analytics)
- **Image**: Same as API service
- **Command**: `dramatiq app.tasks.background_tasks --processes 2 --threads 4`
- **Production Replicas**: 2
- **Health Check**: Process monitoring

### Redis Service
- **Purpose**: Message broker for background tasks
- **Image**: `redis:7-alpine`
- **Persistence**: Enabled with AOF
- **Production**: Memory limited with LRU eviction

### MongoDB Service
- **Purpose**: Application database
- **Image**: `mongo:7`
- **Authentication**: Root user configured
- **Production**: Resource limited

### Nginx Service (Production Only)
- **Purpose**: Reverse proxy and load balancer
- **Features**: Rate limiting, security headers, SSL support
- **Ports**: 80 (HTTP), 443 (HTTPS)

## Environment Configuration

### Required Environment Variables

```bash
# Application
APP_NAME=Your App Name
APP_DOMAIN=https://your-domain.com
SECRET_KEY=your-super-secure-secret-key

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
MONGO_DATABASE=your_app_db

# Email
EMAILS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAILS_FROM_EMAIL=noreply@your-domain.com
EMAILS_FROM_NAME=Your App
```

### Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **Secret Key**: Generate a strong SECRET_KEY for JWT tokens
3. **SSL Certificates**: Configure SSL for production domains
4. **Network Security**: Use Docker networks and firewall rules
5. **Environment Variables**: Use secret management for sensitive data

## Scaling

### Horizontal Scaling

**API Scaling:**
```yaml
api:
  deploy:
    replicas: 4  # Increase API instances
```

**Worker Scaling:**
```yaml
workers:
  deploy:
    replicas: 3  # Increase worker instances
  command: ["uv", "run", "dramatiq", "app.tasks.background_tasks", "--processes", "4", "--threads", "8"]
```

**Database Scaling:**
- Use MongoDB Atlas or managed MongoDB cluster
- Configure replica sets for high availability
- Set up read replicas for read-heavy workloads

### Vertical Scaling

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      memory: 1G      # Increase memory
      cpus: '1.0'     # Increase CPU
    reservations:
      memory: 512M
      cpus: '0.5'
```

## Monitoring

### Health Checks

All services include health checks:
- **API**: HTTP health endpoint
- **Workers**: Process monitoring
- **Redis**: Redis ping command
- **MongoDB**: Database connection test

### Logs

**View all logs:**
```bash
./deploy.sh logs
```

**View specific service logs:**
```bash
./deploy.sh logs api
./deploy.sh logs workers
./deploy.sh logs redis
```

**Live log monitoring:**
```bash
docker-compose logs -f api workers
```

### Metrics

Consider adding:
- Prometheus for metrics collection
- Grafana for visualization
- Redis monitoring for task queue metrics
- Application performance monitoring (APM)

## Deployment Commands

### Basic Operations

```bash
# Deploy development
./deploy.sh dev

# Deploy production
./deploy.sh prod

# Stop all services
./deploy.sh stop

# View service status
./deploy.sh status

# Clean up resources
./deploy.sh cleanup
```

### Docker Compose Operations

```bash
# Build and start
docker-compose up --build -d

# Scale services
docker-compose up --scale api=3 --scale workers=2 -d

# Update single service
docker-compose up --build -d api

# View resource usage
docker stats
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 8000, 6379, 27017 are available
2. **Environment Variables**: Check .env file configuration
3. **Docker Resources**: Ensure sufficient memory and disk space
4. **Network Issues**: Verify Docker network connectivity

### Debug Commands

```bash
# Check service health
docker-compose ps

# Inspect service logs
docker-compose logs api

# Execute commands in containers
docker-compose exec api bash
docker-compose exec workers bash

# Check Redis connection
docker-compose exec redis redis-cli ping

# Check MongoDB connection
docker-compose exec mongodb mongosh
```

### Performance Tuning

1. **Worker Configuration**: Adjust processes and threads based on workload
2. **Redis Memory**: Configure appropriate memory limits
3. **Database Connections**: Tune connection pool settings
4. **Nginx Configuration**: Optimize worker processes and connections

## Production Checklist

- [ ] Environment variables configured
- [ ] Secure passwords set
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Log aggregation configured
- [ ] Health checks validated
- [ ] Security scan completed
- [ ] Load testing performed

## Cloud Deployment

### AWS Deployment
- Use ECS with Fargate for container orchestration
- RDS for managed MongoDB (DocumentDB)
- ElastiCache for managed Redis
- ALB for load balancing

### Google Cloud Platform
- Use Cloud Run for serverless containers
- Cloud SQL for managed databases
- Cloud Memorystore for Redis
- Cloud Load Balancing

### Azure Deployment
- Use Container Instances or AKS
- Cosmos DB for MongoDB
- Azure Cache for Redis
- Azure Load Balancer

## Support

For deployment issues:
1. Check service logs: `./deploy.sh logs`
2. Verify configuration: `./deploy.sh status`
3. Review this documentation
4. Check Docker and container health