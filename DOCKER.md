# Docker Setup

Run the entire application with a single command using Docker.

## Quick Start

1. **Build and run:**
   ```bash
   docker-compose up --build
   ```

2. **Open your browser:**
   - Go to `http://localhost:3001`
   - Enter your Steam API key in the UI
   - Start using the app!

## Commands

### Start the application
```bash
docker-compose up
```

### Build and start (rebuild if changes made)
```bash
docker-compose up --build
```

### Run in detached mode (background)
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild from scratch
```bash
docker-compose build --no-cache
docker-compose up
```

## What Docker Does

The Docker setup:
1. **Builds the frontend** - Compiles React/TypeScript to static files
2. **Sets up the backend** - Installs Node.js dependencies
3. **Serves everything** - Backend serves both API and frontend on port 3001
4. **Single container** - Everything runs in one container for simplicity

## Port

The application runs on **port 3001** by default. You can change it by:
- Modifying `docker-compose.yml` ports mapping
- Setting `PORT` environment variable

## Environment Variables

You can set environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3001
```

## Troubleshooting

### Port already in use
If port 3001 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Use port 3002 on your machine
```

### Rebuild after code changes
After making code changes, rebuild:
```bash
docker-compose up --build
```

### Check if container is running
```bash
docker-compose ps
```

### View container logs
```bash
docker-compose logs steam-games-list
```

