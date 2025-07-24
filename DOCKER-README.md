# Docker Setup

Simple Docker setup with Traefik for reverse proxy and automatic HTTPS.

## Quick Start

```bash
# Start
./docker-scripts.sh up

# Stop
./docker-scripts.sh down

# View logs
./docker-scripts.sh logs
```

## Access
- **API**: http://api.localhost
- **Dashboard**: http://localhost:8080

## Configuration

Copy `env.example` to `.env` and modify:
```bash
API_DOMAIN=api.localhost
ACME_EMAIL=admin@example.com
```

For manual control: `docker compose up -d`

## Production

1. Set your domain: `API_DOMAIN=api.yourdomain.com`
2. Set your email: `ACME_EMAIL=your@email.com`  
3. Point DNS A record to your server
4. Run: `./docker-scripts.sh up`

Automatic HTTPS certificates via Let's Encrypt.

## Commands

```bash
./docker-scripts.sh up      # Start stack
./docker-scripts.sh down    # Stop stack  
./docker-scripts.sh logs    # View logs
./docker-scripts.sh build   # Rebuild images
./docker-scripts.sh clean   # Clean everything
``` 