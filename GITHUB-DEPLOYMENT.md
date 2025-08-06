# GitHub Actions Deployment Setup

## Required GitHub Secrets

Nastav tyto secrets v GitHub repo → Settings → Secrets and variables → Actions:

### SSH Connection
- `SSH_PRIVATE_KEY` - SSH private key pro přístup na VPS
- `VPS_HOST` - IP adresa nebo hostname VPS serveru
- `VPS_USER` - uživatelské jméno na VPS

### API Configuration
- `API_DOMAIN` - doména kde poběží API (např. `api.yourdomain.com`)

## VPS Setup

### 1. Připrav VPS server
```bash
# Předpoklad: Docker, Docker Compose a Traefik už běží
# Vytvoř externí síť pro Traefik (pokud neexistuje)
docker network create web || true
```

### 2. SSH Key Setup
```bash
# Na lokálním počítači vygeneruj SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Zkopíruj public key na VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-vps-ip

# Private key zkopíruj do GitHub secrets jako SSH_PRIVATE_KEY
cat ~/.ssh/id_rsa
```

### 3. Doména a DNS
- Nastav A record pro tvoji doménu na IP VPS
- Tvůj existující Traefik automaticky vygeneruje Let's Encrypt SSL

## Deployment Process

1. **Push do main branch** → automaticky spustí deployment
2. **Sync files** → rsync nahraje změny na VPS
3. **Deploy** → spustí `./deploy.sh restart` na serveru
4. **Health check** → ověří že API běží

## Monitoring

Po deployi můžeš checkovat:
```bash
# SSH na VPS
ssh user@your-vps-ip

# Status služeb
cd mini-counter-api && docker compose ps

# Logy
docker compose logs -f counter-api

# Tvůj existující Traefik dashboard
```

## Troubleshooting

### Deployment fails
- Check GitHub Actions logs
- SSH na VPS a zkontroluj `docker compose logs`

### SSL problémy
- Ověř DNS nastavení
- Check Traefik logs: `docker compose logs traefik`

### Health check fails
- API možná potřebuje víc času na start
- Zkontroluj port mapping v docker-compose.yml