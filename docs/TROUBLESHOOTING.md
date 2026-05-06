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

## Antigravity server crash on VPS

Do not run Antigravity language server or Remote-SSH agent execution directly on the VPS. The VPS CPU does not expose AES instructions required by the Antigravity language server.
