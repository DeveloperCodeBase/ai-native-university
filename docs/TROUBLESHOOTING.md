# Troubleshooting Guide

## Common Issues

### Docker build fails

```powershell
.\scripts\remote.ps1 rebuild-clean
.\scripts\remote.ps1 logs
```

### Health check fails

```powershell
.\scripts\remote.ps1 diagnose
.\scripts\remote.ps1 logs
```

Check if all containers are running:
```powershell
.\scripts\remote.ps1 status
```

### Database connection error

1. Check postgres container is healthy: `.\scripts\remote.ps1 status`
2. Check `DATABASE_URL` in `.env` matches docker-compose service name
3. Run migrations: `.\scripts\remote.ps1 db-migrate`

### API returns 502

1. API container may still be starting. Wait 15 seconds.
2. Check logs: `.\scripts\remote.ps1 logs`
3. Rebuild: `.\scripts\remote.ps1 restart`

### AI Gateway not responding

1. Check AI Gateway logs: `.\scripts\remote.ps1 logs`
2. Verify `AI_MODE` in `.env` (should be `mock` for no-GPU server)
3. Check `/ai/health` endpoint

### Port conflict

If port 3010 is already in use:
1. Change `EXTERNAL_PORT` in `.env`
2. Restart: `.\scripts\remote.ps1 restart`

### .env missing on server

```powershell
.\scripts\remote.ps1 env-create
```

### Prisma migration errors

```powershell
.\scripts\remote.ps1 db-migrate
.\scripts\remote.ps1 logs
```

## Log Commands

```powershell
.\scripts\remote.ps1 logs          # Last 300 lines
.\scripts\remote.ps1 logs-live     # Live tail
.\scripts\remote.ps1 diagnose      # Full diagnostic
```
