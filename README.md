# FastAPI Fullstack Starting Template

A fullstack application starter template with FastAPI backend and React frontend.

## Project Structure

```
api_starter/
├── backend/           # FastAPI Python backend
│   ├── app/          # Main application code
│   │   ├── api/      # API endpoints (v1/auth, v1/user, v1/role)
│   │   ├── core/     # Core functionality (config, security)
│   │   ├── db/       # Database management
│   │   ├── models/   # Data models
│   │   ├── services/ # Business logic services
│   │   └── utils/    # Utility functions
│   ├── pyproject.toml # Python dependencies
│   └── app.py        # Application entry point
├── frontend/         # React frontend
│   ├── src/          # Source code
│   │   ├── api/      # API client
│   │   ├── components/ # React components
│   │   ├── contexts/ # React contexts (auth, theme, etc.)
│   │   ├── hooks/    # Custom React hooks
│   │   └── routes/   # Application routes
│   ├── package.json  # Node.js dependencies
│   └── vite.config.js # Vite configuration
└── docker/           # Docker configuration
    └── docker-compose.yml
```

## Installation

### Prerequisites
- Python 3.12 or higher
- Node.js 18 or higher
- uv (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies using uv:
```bash
uv sync
```

3. Set up environment variables (create `.env` file):
```bash
# Copy and modify the example environment file
cp .env.example .env
```

4. Run the backend:
```bash
uv run fastapi dev app.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Docker Setup (Alternative)

Run the entire stack with Docker:

```bash
cd docker
./start.sh
```

## Features

- **Authentication**: JWT-based auth with magic links and social login
- **User Management**: Role-based access control (Admin, Manager, User)
- **Modern Frontend**: React 19 with TypeScript, TanStack Router, and Tailwind CSS
- **API**: RESTful API with FastAPI and automatic documentation
- **Database**: MongoDB with Beanie ODM
- **Testing**: Vitest for frontend testing
- **Deployment**: Docker-ready configuration

## Development

### Backend Development
- API documentation available at `http://localhost:8000/docs`
- Uses FastAPI with Beanie (MongoDB ODM)
- JWT authentication with role-based permissions

### Frontend Development
- Built with React 19 and TypeScript
- Uses TanStack Router for routing
- Tailwind CSS for styling
- Shadcn/ui components

## Mentions
