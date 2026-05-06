# Troubleshooting

## Dockerfile not found

Error:

```text
failed to read dockerfile: open Dockerfile: no such file or directory
```

Fix:

- The file must be named exactly `Dockerfile`, not `Dockerfile.txt`.

## Docker permission denied

Error:

```text
permission denied while trying to connect to the docker API
```

Fix on server:

```bash
sudo usermod -aG docker ubuntu
sudo systemctl restart docker
exit
```

Then reconnect:

```powershell
ssh my-vps
```

## Port already in use

If port 3000 is already used, expose another host port in `docker-compose.yml`:

```yaml
ports:
  - "3010:3000"
```

## GitHub SSH port 22 blocked

Use SSH over port 443:

```text
Host github.com
    HostName ssh.github.com
    Port 443
    User git
```

## OpenRouter API key missing

Error:

```text
OPENROUTER_API_KEY is missing
```

Fix:

```powershell
.\scripts\remote.ps1 env-check
```

Then edit the server `.env` file:

```powershell
ssh my-vps
```

```bash
cd /var/www/ai-native-university
nano .env
chmod 600 .env
```

## Container keeps restarting

If the container crashes in a restart loop:

```powershell
.\scripts\remote.ps1 logs
```

Common causes:

- Missing `express` module — run `.\scripts\remote.ps1 rebuild-clean`
- Syntax error in JS — check logs for file and line number
- Missing `.env` — run `.\scripts\remote.ps1 env-create`

## npm ci fails in Docker

Error:

```text
npm ERR! `npm ci` can only install packages when your package.json and package-lock.json are in sync
```

Fix: On Windows, run `npm install` to update `package-lock.json`, then commit and push.

## Health check fails after deploy

The container may need a few seconds to start. The `full-check` command includes a 5-second delay. If it still fails:

```powershell
Start-Sleep -Seconds 10
.\scripts\remote.ps1 health
```

## AI tutor returns errors

1. Verify OpenRouter API key is set:

```powershell
.\scripts\remote.ps1 env-check
```

2. Check if the model slug exists on OpenRouter.
3. Check logs for error details:

```powershell
.\scripts\remote.ps1 logs
```

## Frontend not loading

If the frontend shows a blank page:

1. Check browser developer tools console for JS errors.
2. Verify `public/index.html`, `public/css/styles.css`, and `public/js/app.js` exist.
3. Ensure `express.static` is configured in `server.js`.

## Antigravity server crash on VPS

Do not run Antigravity language server or Remote-SSH agent execution directly on the VPS. The VPS CPU does not expose AES instructions required by the Antigravity language server.
