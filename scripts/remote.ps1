param(
    [Parameter(Mandatory=$true)]
    [ValidateSet(
        "push",
        "pull",
        "server-update",
        "bootstrap-server",
        "env-check",
        "env-create",
        "build",
        "up",
        "down",
        "restart",
        "rebuild-clean",
        "logs",
        "logs-live",
        "test",
        "status",
        "health",
        "ai-health",
        "diagnose",
        "docs-check",
        "full-check",
        "shell"
    )]
    [string]$Action
)

$Server = "my-vps"
$ProjectPath = "/var/www/ai-native-university"
$Branch = "main"
$HealthUrl = "http://193.163.201.141:3010/health"
$AiHealthUrl = "http://193.163.201.141:3010/api/ai-health"

function Remote($cmd) {
    ssh $Server "cd $ProjectPath && $cmd"
}

function Push-Code {
    git status
    git add -A

    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "No staged changes to commit."
    } else {
        git commit -m "agent update"
    }

    git push origin $Branch
}

switch ($Action) {
    "push" {
        Push-Code
    }

    "pull" {
        Remote "git pull origin $Branch"
    }

    "server-update" {
        Remote "git pull origin $Branch"
    }

    "bootstrap-server" {
        Push-Code
        Remote "git pull origin $Branch && mkdir -p logs storage tmp && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; echo 'Created .env from .env.example. Review secrets if needed.'; fi && chmod 600 .env 2>/dev/null || true"
    }

    "env-check" {
        Remote "echo '--- env files ---' && ls -la .env .env.example 2>/dev/null || true && echo '--- env.example ---' && if [ -f .env.example ]; then sed -n '1,220p' .env.example; else echo '.env.example missing'; fi"
    }

    "env-create" {
        Remote "if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env && echo '.env created from .env.example'; elif [ -f .env ]; then echo '.env already exists'; else echo 'ERROR: .env.example missing'; exit 1; fi"
    }

    "build" {
        Push-Code
        Remote "git pull origin $Branch && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env; fi && docker compose build"
    }

    "up" {
        Push-Code
        Remote "git pull origin $Branch && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env; fi && docker compose up -d --build"
    }

    "down" {
        Remote "docker compose down"
    }

    "restart" {
        Push-Code
        Remote "git pull origin $Branch && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env; fi && docker compose down && docker compose up -d --build"
    }

    "rebuild-clean" {
        Push-Code
        Remote "git pull origin $Branch && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env; fi && docker compose down --remove-orphans && docker compose build --no-cache && docker compose up -d"
    }

    "logs" {
        Remote "docker compose logs --tail=300"
    }

    "logs-live" {
        ssh $Server "cd $ProjectPath && docker compose logs -f --tail=150"
    }

    "test" {
        Push-Code
        Remote "git pull origin $Branch && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env; fi && docker compose up -d --build && sleep 5 && docker compose exec app node --test tests/api.test.js"
    }

    "status" {
        Remote "echo '--- git ---' && git status && echo '--- files ---' && ls -la && echo '--- compose ---' && docker compose ps || true && echo '--- docker ---' && docker ps"
    }

    "health" {
        try {
            Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 20
        } catch {
            Write-Host "Health check failed:"
            Write-Host $_
            exit 1
        }
    }

    "ai-health" {
        try {
            Invoke-WebRequest -Uri $AiHealthUrl -UseBasicParsing -TimeoutSec 60
        } catch {
            Write-Host "AI health check failed:"
            Write-Host $_
            exit 1
        }
    }

    "diagnose" {
        Remote "echo '--- git ---' && git status && echo '--- files ---' && ls -la && echo '--- env ---' && ls -la .env .env.example 2>/dev/null || true && echo '--- compose ps ---' && docker compose ps || true && echo '--- docker ps ---' && docker ps && echo '--- recent logs ---' && docker compose logs --tail=300 || true && echo '--- disk ---' && df -h && echo '--- docker disk ---' && docker system df"
    }

    "docs-check" {
        if (!(Test-Path "README.md")) { Write-Host "README.md missing"; exit 1 }
        if (!(Test-Path "AGENT_RUNBOOK.md")) { Write-Host "AGENT_RUNBOOK.md missing"; exit 1 }
        if (!(Test-Path ".env.example")) { Write-Host ".env.example missing"; exit 1 }
        if (!(Test-Path "docs")) { Write-Host "docs folder missing"; exit 1 }
        Write-Host "Docs baseline exists."
    }

    "full-check" {
        Push-Code
        Remote "git pull origin $Branch && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && chmod 600 .env; fi && docker compose up -d --build && sleep 5 && docker compose logs --tail=150"
        Start-Sleep -Seconds 3
        try {
            $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 30
            Write-Host "Health check passed: $($response.StatusCode)"
            Write-Host $response.Content
        } catch {
            Write-Host "Health check failed:"
            Write-Host $_
            exit 1
        }
    }

    "shell" {
        ssh $Server
    }
}
