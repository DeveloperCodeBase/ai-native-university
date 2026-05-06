param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("push","pull","build","up","down","restart","logs","logs-live","test","status","shell","server-update")]
    [string]$Action
)

$Server = "my-vps"
$ProjectPath = "/var/www/ai-native-university"
$Branch = "main"

function Remote($cmd) {
    ssh $Server "cd $ProjectPath && $cmd"
}

function Push-Code {
    git status
    git add .
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

    "build" {
        Push-Code
        Remote "git pull origin $Branch && docker compose build"
    }

    "up" {
        Push-Code
        Remote "git pull origin $Branch && docker compose up -d --build"
    }

    "down" {
        Remote "docker compose down"
    }

    "restart" {
        Push-Code
        Remote "git pull origin $Branch && docker compose down && docker compose up -d --build"
    }

    "logs" {
        Remote "docker compose logs --tail=200"
    }

    "logs-live" {
        ssh $Server "cd $ProjectPath && docker compose logs -f --tail=100"
    }

    "test" {
        Push-Code
        Remote "git pull origin $Branch && docker compose run --rm app npm test"
    }

    "status" {
        Remote "git status && docker compose ps || true && docker ps"
    }

    "shell" {
        ssh $Server
    }
}