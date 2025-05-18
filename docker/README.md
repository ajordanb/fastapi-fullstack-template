# Local Development Environment

This directory contains the configuration for running the application locally using Docker Compose.


## Prerequisites

- Docker and Docker Compose installed
- Copy `.env.example` to `.env` and adjust values as needed
- Valid `gurobi_isv.json` if using Gurobi solver

## Environment Variables

The following environment variables can be set in `.env`:

- `API_KEY` - API key for authentication
- `API_URL` - API base URL (default: /api/)
- `API_ROOT_PATH` - API root path (default: /api/)
- `SOLVER` - Solver to use (default: cbc)
- `PROXY_LISTEN_PORT` - Port to expose the application (default: 88)
- `WITH_GUROBI` - Whether to include Gurobi support (default: false)
    - Note: Requires `gurobi_isv.json` license file when true

## Important: Gurobi License

If you plan to use Gurobi (`WITH_GUROBI=true`), you must have a valid `gurobi_isv.json` license file in your backend directory. The build will fail if:
- `WITH_GUROBI=true` is set (either via .env or command line)
- AND `gurobi_isv.json` is missing from the backend directory

If you're not using Gurobi (`WITH_GUROBI=false`), the license file is not required.

## Quick Start

Start the application:
```bash
# Without Gurobi
./start.sh

# With Gurobi (requires gurobi_isv.json)
./start.sh --with-gurobi
```

Stop and clean up:
```bash
./stop.sh
```

## What's Included

The setup includes:
- Frontend container
- Backend container (with optional Gurobi support)
- Nginx reverse proxy

All containers and volumes are ephemeral and will be removed when stopped.

## Configuration Files

- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx reverse proxy configuration
- `.env` - Environment variables
- `start.sh` - Startup script
- `stop.sh` - Cleanup script
- `gurobi_isv.json` - Gurobi license file (required if `WITH_GUROBI=true`)

## Ports

The application is exposed on port 88 by default (configurable via PROXY_LISTEN_PORT).
