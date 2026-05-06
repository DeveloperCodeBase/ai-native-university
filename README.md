# AI Native University

AI Native University is a remote-deployable software project developed locally on Windows using Google Antigravity and executed on an Ubuntu VPS through Docker.

## Project Goals

- Build a production-ready AI-native university platform.
- Keep implementation, deployment, testing, and documentation synchronized.
- Use GitHub as the source of truth.
- Use Ubuntu VPS as the runtime and test environment.
- Use OpenRouter as the only AI model gateway.
- Use Google Antigravity as the coding and agentic implementation environment.

## Runtime Architecture

```text
Windows Laptop + Google Antigravity
        ↓
Git commit / push
        ↓
GitHub Repository
        ↓
Ubuntu VPS git pull
        ↓
Docker Compose build / run / test
        ↓
Logs / health checks
        ↓
Code fixes on Windows
```

## Important Rules

Do not run production Docker commands directly on Windows.

All runtime, tests, logs, Docker builds, and deployment must run on the Ubuntu VPS through:

```powershell
.\scripts\remote.ps1
```

Do not use direct AI provider APIs. All AI calls must go through OpenRouter only.

Forbidden direct provider keys:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `GROQ_API_KEY`
- `TOGETHER_API_KEY`
- `MISTRAL_API_KEY`
- `COHERE_API_KEY`

Allowed AI variables:

```env
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=openai/gpt-5.3-codex
OPENROUTER_FAST_MODEL=openai/gpt-5.3-codex
OPENROUTER_REASONING_MODEL=openai/gpt-5.3-codex
```

## Server

- VPS IP: `193.163.201.141`
- SSH alias: `my-vps`
- User: `ubuntu`
- Remote path: `/var/www/ai-native-university`
- Public test URL: `http://193.163.201.141:3010`
- Health URL: `http://193.163.201.141:3010/health`
- AI health URL: `http://193.163.201.141:3010/api/ai-health`

## Requirements

### Windows

- Git
- OpenSSH Client
- PowerShell
- Google Antigravity
- Access to the GitHub repository

### Ubuntu VPS

- Git
- Docker
- Docker Compose
- SSH access
- GitHub Deploy Key

## Setup on Windows

Clone the repository:

```powershell
git clone git@github.com:DeveloperCodeBase/ai-native-university.git
cd ai-native-university
```

Check remote server status:

```powershell
.\scripts\remote.ps1 status
```

Bootstrap server files and `.env`:

```powershell
.\scripts\remote.ps1 bootstrap-server
```

Deploy:

```powershell
.\scripts\remote.ps1 up
```

View logs:

```powershell
.\scripts\remote.ps1 logs
```

Run tests:

```powershell
.\scripts\remote.ps1 test
```

Run full check:

```powershell
.\scripts\remote.ps1 full-check
```

Run AI health check:

```powershell
.\scripts\remote.ps1 ai-health
```

## Setup on Ubuntu VPS

Project path:

```bash
cd /var/www/ai-native-university
```

Pull latest code:

```bash
git pull origin main
```

Create `.env` from `.env.example` if needed:

```bash
cp .env.example .env
chmod 600 .env
```

Run Docker Compose:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs --tail=200
```

## Environment Variables

The real `.env` file must exist only on the server and must never be committed.

Template file:

```text
.env.example
```

If environment variables change, update:

- `.env.example`
- `README.md`
- `docs/DEPLOYMENT.md`

## API Endpoints

### Basic health

```text
GET /health
```

### AI health through OpenRouter

```text
GET /api/ai-health
```

### Basic chat through OpenRouter

```text
POST /api/chat
Content-Type: application/json

{
  "message": "Hello"
}
```

## Documentation

Documentation must be updated with every meaningful implementation change.

Main documentation files:

- `README.md`
- `AGENT_RUNBOOK.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/DEPLOYMENT.md`
- `docs/TROUBLESHOOTING.md`
- `docs/CHANGELOG.md`

## Agent Workflow

Google Antigravity must follow this workflow:

1. Read `AGENT_RUNBOOK.md`.
2. Edit code locally on Windows.
3. Update documentation.
4. Commit and push changes.
5. Run remote deploy/test through `scripts/remote.ps1`.
6. Inspect logs and health checks.
7. Fix errors locally.
8. Repeat until successful.

## Useful Commands

```powershell
.\scripts\remote.ps1 status
.\scripts\remote.ps1 bootstrap-server
.\scripts\remote.ps1 env-check
.\scripts\remote.ps1 env-create
.\scripts\remote.ps1 up
.\scripts\remote.ps1 restart
.\scripts\remote.ps1 logs
.\scripts\remote.ps1 logs-live
.\scripts\remote.ps1 test
.\scripts\remote.ps1 diagnose
.\scripts\remote.ps1 health
.\scripts\remote.ps1 ai-health
.\scripts\remote.ps1 full-check
```

## Troubleshooting

See:

```text
docs/TROUBLESHOOTING.md
```
