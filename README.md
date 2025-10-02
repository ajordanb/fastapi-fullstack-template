# FastAPI Fullstack Starting Template

A production-ready fullstack application starter template with FastAPI backend, React frontend, and background task processing.

## Project Structure

```
api_starter/
├── backend/           # FastAPI Python backend
│   ├── app/          # Main application code
│   │   ├── api/      # API endpoints
│   │   │   └── v1/   # API version 1
│   │   │       ├── auth/     # Authentication endpoints
│   │   │       ├── user/     # User management endpoints
│   │   │       ├── role/     # Role management endpoints
│   │   │       └── dramatiq/ # Background task endpoints
│   │   ├── core/     # Core functionality
│   │   │   ├── config.py         # Application configuration
│   │   │   ├── security/         # Security utilities
│   │   │   └── dramatiq_config.py # Background task configuration
│   │   ├── db/       # Database management
│   │   │   ├── db_manager.py    # Database connection manager
│   │   │   └── dependencies.py  # Database dependencies
│   │   ├── models/   # Data models (User, Role, etc.)
│   │   ├── services/ # Business logic services
│   │   │   ├── user/        # User service layer
│   │   │   ├── email/       # Email service with templates
│   │   │   └── dramatiq/    # Background task services
│   │   ├── tasks/    # Background task definitions
│   │   └── utils/    # Utility functions
│   ├── tools/        # Development tools
│   │   ├── manage.py # Development stack management
│   │   └── redis-docker-compose.yaml # Redis for local development
│   ├── worker.py     # Background worker entry point
│   └── pyproject.toml # Python dependencies
├── frontend/         # React frontend
│   ├── src/          # Source code
│   │   ├── api/      # API client
│   │   ├── components/ # React components
│   │   ├── contexts/ # React contexts (auth, theme, etc.)
│   │   ├── hooks/    # Custom React hooks
│   │   └── routes/   # Application routes
│   ├── .mcp.json     # Model Context Protocol configuration
│   ├── package.json  # Node.js dependencies
│   └── vite.config.js # Vite configuration
└── README.md         # This file
```

## Quick Start

### Prerequisites
- Python 3.12 or higher
- Node.js 18 or higher
- uv (Python package manager)
- Docker (for Redis and optional containerized deployment)

### Development Setup

The easiest way to get started is using the built-in development tools:

1. **Clone and navigate to the project:**
```bash
git clone <your-repo>
cd api_starter/backend
```

2. **Install Python dependencies:**
```bash
uv sync
```

3. **Start the full development stack:**
```bash
python tools/manage.py
```

Select "Development Stack (All)" to start:
- Redis (message broker)
- FastAPI backend server
- Dramatiq background workers

This will start all services and display:
- API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs
- Redis: localhost:6379

### Manual Setup (Alternative)

#### Backend Setup

1. **Install dependencies:**
```bash
cd backend
uv sync
```

2. **Configure environment** (optional - has sensible defaults):
```bash
# Copy and modify the example environment file if needed
cp .env.example .env
```

3. **Start Redis** (required for background tasks):
```bash
python tools/manage.py  # Select "Local Redis"
```

4. **Run the backend:**
```bash
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

5. **Run background workers** (in separate terminal):
```bash
uv run dramatiq app.tasks.background_tasks --watch app --processes 1 --threads 2
```

#### Frontend Setup

1. **Navigate and install:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Features

### Backend
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **Authentication**: JWT-based auth with magic links, password reset, and API keys
- **User Management**: Role-based access control (Admin, Manager, User)
- **Background Tasks**: Dramatiq with Redis for async email processing and cleanup
- **Email System**: Professional email templates with Jinja2 templating
- **Database**: MongoDB with Beanie ODM and connection pooling
- **Service Layer**: Clean architecture with service layer pattern
- **Health Checks**: Built-in health monitoring endpoints
- **Monitoring**: Datadog APM integration for traces, metrics, and logs
- **Development Tools**: Integrated development stack management

### Frontend
- **Modern React**: React 19 with TypeScript and strict type safety
- **Routing**: TanStack Router for type-safe routing
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Development**: Hot reload with Vite and comprehensive dev tools
- **MCP Integration**: Model Context Protocol support for AI assistance

### DevOps & Tools
- **Development Stack**: One-command setup for local development
- **Containerization**: Docker support for deployment
- **Package Management**: UV for fast Python dependency management
- **Background Processing**: Redis-backed task queue with monitoring
- **Observability**: Datadog APM, metrics, and log collection
- **Code Quality**: Integrated linting and formatting

## Development

### Development Tools

The project includes a comprehensive development management system:

```bash
cd backend
python tools/manage.py
```

**Available options:**
- **Development Stack (All)**: Starts Redis + API + Workers with one command
- **API Only**: Runs just the FastAPI server
- **Workers Only**: Runs just the background task workers
- **Local Redis**: Starts Redis container for development

### Backend Development
- **API Documentation**: Available at `http://localhost:8000/docs`
- **Background Tasks**: Monitor tasks at `http://localhost:8000/v1/dramatiq/`
- **Database**: MongoDB with automatic connection management
- **Email Templates**: Located in `app/services/email/email-templates/built/`
- **Service Layer**: Business logic in `app/services/` directory

### Frontend Development
- **Hot Reload**: Automatic browser refresh on file changes
- **Type Safety**: Full TypeScript integration with API types
- **Component Library**: Shadcn/ui components for consistent UI
- **API Integration**: Auto-generated API client with type safety

### Architecture

This template follows modern software architecture patterns:

- **Service Layer Pattern**: Business logic separated from API endpoints
- **Dependency Injection**: Clean dependency management throughout
- **Background Processing**: Async tasks for email, cleanup, and analytics
- **Clean API Design**: RESTful endpoints with proper HTTP methods
- **Type Safety**: End-to-end type safety from database to frontend

## Monitoring & Observability

This template includes Datadog integration for comprehensive application monitoring:

### Datadog Setup

1. **Sign up for Datadog**: Get your free account at [datadoghq.com](https://www.datadoghq.com/)

2. **Get your API key**: Find it at https://app.datadoghq.com/organization-settings/api-keys

3. **Configure environment variables**:
```bash
# Add to your .env file
DD_API_KEY=your_datadog_api_key_here
DD_SITE=datadoghq.com  # or datadoghq.eu for EU
DD_SERVICE=api_starter
DD_ENV=production  # dev, staging, or production
DD_TRACE_ENABLED=true
```

4. **Start with monitoring**:
```bash
# Start all services including Datadog agent
docker-compose --profile monitoring up
```

### What's Monitored

- **APM Traces**: Automatic tracing of all API requests, database queries, and external HTTP calls
- **Custom Metrics**: Background job completion/failure rates with tags (actor, queue, namespace)
- **Logs**: Application logs with automatic trace correlation
- **Infrastructure**: Container metrics, process monitoring, and resource usage
- **Health Status**: Database, Redis, and worker health monitoring

All metrics and traces are viewable in your Datadog dashboard with zero additional configuration.

## Deployment

### Production Deployment

1. **Environment Configuration**: Set production environment variables
2. **Database**: Configure production MongoDB instance
3. **Redis**: Set up Redis instance for background tasks
4. **Datadog**: Configure DD_API_KEY and monitoring settings
5. **Workers**: Deploy background workers separately or as containers
6. **API**: Deploy FastAPI application with production ASGI server

### Container Deployment

The project supports containerized deployment with separate containers for:
- FastAPI API server
- Dramatiq background workers
- Redis message broker
- MongoDB database
- Datadog agent (optional, for monitoring)

## Contributing

This template is designed to be a starting point for your projects. Feel free to:
- Customize the user model and permissions
- Add new background tasks
- Extend the email template system
- Add new API endpoints
- Customize the frontend components

## License

MIT License - feel free to use this template for your projects.
