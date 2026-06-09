# git-helper.ps1
# Helper script to force explicit permission before executing any Git operation.
# Place this file in the root of the project (caominhada-petsalut).
# Usage examples:
#   .\git-helper.ps1 add   # stages all changes
#   .\git-helper.ps1 commit "Your message"
#   .\git-helper.ps1 push   # pushes to remote

function Request-Permission {
    param(
        [string]$ActionDescription
    )
    Write-Host "=== PERMISSÃO REQUERIDA ===" -ForegroundColor Yellow
    Write-Host "Ação: $ActionDescription"
    $response = Read-Host "Digite 'sim' para autorizar ou qualquer outra coisa para cancelar"
    if ($response -ne 'sim') {
        Write-Host "Operação cancelada pelo usuário." -ForegroundColor Red
        exit 1
    }
    Write-Host "Permissão concedida. Continuando..." -ForegroundColor Green
}

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('add','commit','push','status','pull')]
    [string]$GitCommand,
    [string]$Message
)

switch ($GitCommand) {
    'add' {
        Request-Permission "git add -A"
        git add -A
    }
    'commit' {
        if (-not $Message) {
            Write-Host "Erro: a mensagem de commit é obrigatória para o comando commit." -ForegroundColor Red
            exit 1
        }
        Request-Permission "git commit -m \"$Message\""
        git commit -m "$Message"
    }
    'push' {
        Request-Permission "git push"
        git push
    }
    'status' {
        Request-Permission "git status"
        git status
    }
    'pull' {
        Request-Permission "git pull"
        git pull
    }
    default {
        Write-Host "Comando desconhecido: $GitCommand" -ForegroundColor Red
        exit 1
    }
}
