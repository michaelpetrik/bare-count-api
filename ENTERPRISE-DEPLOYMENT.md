# 🏢 Enterprise Deployment Guide

Production-ready deployment of Bare Count API with enterprise security features.

## 🚀 Quick Deploy

### Prerequisites
- Docker & Docker Compose v2
- Domain name pointed to your server
- Port 80/443 open for HTTPS

### One-command deployment
```bash
git clone <your-repo>
cd mini-counter-api
chmod +x deploy.sh
./deploy.sh start
```

**That's it!** 🎉 Your tracking API is live with:
- ✅ Automatic HTTPS (Let's Encrypt)
- ✅ Rate limiting (100 req/min per IP)
- ✅ Enterprise security headers
- ✅ Frontend tracker script at `/tracker.js`

---

## 📊 Available Endpoints

### API Endpoints
```bash
GET  /hit                    # Track page visit
POST /action                 # Track user action
GET  /stats                  # Get visit statistics
GET  /action/stats           # Get action statistics
GET  /actions                # Get all actions (with filters)
GET  /health                 # Health check
```

### Static Files
```bash
GET  /tracker.js             # Frontend tracking script
```

### Example Usage
```html
<!-- Add to your website -->
<script
  src="https://your-domain.com/tracker.js"
  data-endpoint="https://your-domain.com/"
></script>
```

---

## 🔧 Configuration

### Environment Variables (`.env`)
```bash
# Domain configuration
API_DOMAIN=api.yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Application settings
PORT=3000
NODE_ENV=production

# Security settings
RATE_LIMIT_WINDOW=60000        # Rate limit window (ms)
RATE_LIMIT_MAX_REQUESTS=100    # Max requests per window per IP
```

### SSL Certificates
- Automatic via Let's Encrypt
- Renewal handled by Traefik
- HSTS enabled (1 year)
- SSL redirect enforced

---

## 🛡️ Security Features

### Application Level
- **Rate Limiting**: 100 requests/minute per IP
- **Request Size Limits**: 10KB max JSON payload
- **CORS**: Configured with proper headers
- **Input Validation**: All endpoints validate required fields

### HTTP Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Container Security
- **Non-root user**: App runs as `node` user
- **Read-only filesystem**: Container filesystem is read-only
- **Capability dropping**: Only essential capabilities
- **No new privileges**: `no-new-privileges:true`
- **Resource limits**: Memory and CPU constraints

### Network Security
- **Internal networks**: Services communicate via Docker networks
- **Traefik proxy**: Single entry point with SSL termination
- **Firewall ready**: Only ports 80/443/8080 exposed

---

## 📋 Management Commands

### Deployment
```bash
./deploy.sh start       # Start services
./deploy.sh stop        # Stop services  
./deploy.sh restart     # Restart services
./deploy.sh update      # Pull updates and restart
```

### Monitoring
```bash
./deploy.sh status      # Show service status
./deploy.sh logs        # Show live application logs
./deploy.sh ssl-info    # Check SSL certificates
```

### Maintenance
```bash
./deploy.sh build       # Rebuild containers
./deploy.sh backup      # Backup data and config
```

---

## 📈 Monitoring & Logs

### Application Logs
```bash
# Live logs
docker compose logs -f counter-api

# Specific service logs
docker compose logs traefik
docker compose logs counter-api
```

### Health Monitoring
```bash
# Health check endpoint
curl https://your-domain.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z", 
  "version": "1.0.0"
}
```

### Traefik Dashboard
- URL: `http://your-server:8080`
- Shows routes, certificates, services
- **Production**: Disable or secure this endpoint

---

## 🔄 Backup & Recovery

### Automated Backup
```bash
./deploy.sh backup
```

Creates backup in `backups/YYYYMMDD_HHMMSS/`:
- `storage.json` - All tracking data
- `.env` - Configuration

### Manual Backup
```bash
# Create backup directory
mkdir -p backups/manual-$(date +%Y%m%d)

# Copy important files
cp storage.json backups/manual-$(date +%Y%m%d)/
cp .env backups/manual-$(date +%Y%m%d)/
```

### Recovery
```bash
# Stop services
./deploy.sh stop

# Restore files
cp backups/BACKUP_DATE/storage.json ./
cp backups/BACKUP_DATE/.env ./

# Start services
./deploy.sh start
```

---

## ⚡ Performance Tuning

### Rate Limiting
Adjust based on your traffic:
```bash
# In .env file
RATE_LIMIT_WINDOW=60000        # 1 minute window
RATE_LIMIT_MAX_REQUESTS=500    # Higher limit for busy sites
```

### Container Resources
Update `docker-compose.yml`:
```yaml
counter-api:
  deploy:
    resources:
      limits:
        memory: 256M
        cpus: '0.5'
      reservations:
        memory: 128M
        cpus: '0.25'
```

### Caching
- Tracker.js has 1-hour cache headers
- ETags for efficient caching
- Gzip compression via Traefik

---

## 🚨 Troubleshooting

### Service won't start
```bash
# Check logs
./deploy.sh logs

# Check status
./deploy.sh status

# Rebuild if needed
./deploy.sh build
```

### SSL Issues
```bash
# Check certificate status
./deploy.sh ssl-info

# Verify domain DNS
dig your-domain.com

# Check Traefik logs
docker compose logs traefik
```

### Rate Limiting Issues
```bash
# Check current limits in logs
docker compose logs counter-api | grep "Rate limit"

# Adjust limits in .env
RATE_LIMIT_MAX_REQUESTS=200

# Restart
./deploy.sh restart
```

### Data Issues
```bash
# Check storage file
ls -la storage.json

# Backup before changes
./deploy.sh backup

# Reset data (careful!)
echo '{}' > storage.json
./deploy.sh restart
```

---

## 🔐 Production Hardening

### Additional Security
1. **Firewall**: Only allow ports 80, 443, 22
2. **SSH**: Key-based authentication only
3. **Updates**: Regular OS and Docker updates
4. **Monitoring**: Log aggregation and alerting
5. **Backups**: Automated daily backups

### Network Security
```bash
# UFW Firewall example
ufw allow 22/tcp
ufw allow 80/tcp  
ufw allow 443/tcp
ufw enable
```

### Monitoring Integration
```yaml
# Add to docker-compose.yml for Prometheus
labels:
  - "traefik.http.routers.api.middlewares=prometheus"
```

---

## 📞 Support

### Getting Help
1. Check logs: `./deploy.sh logs`
2. Verify config: `cat .env`
3. Test endpoints: `curl https://your-domain.com/health`
4. Check GitHub issues

### Enterprise Support
- Professional deployment assistance
- Custom security configurations  
- Performance optimization
- 24/7 monitoring setup

---

*Enterprise deployment made simple. Ship with confidence! 🚀*