# PowerShell Script para configurar secrets do GitHub Actions
# Execute: .\setup-secrets.ps1

Write-Host "🔐 GitHub Actions Secrets Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se gh CLI está instalado
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) não está instalado!" -ForegroundColor Red
    Write-Host "Instale: https://cli.github.com/"
    exit 1
}

# Verificar autenticação
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Você não está autenticado no GitHub CLI" -ForegroundColor Red
    Write-Host "Execute: gh auth login"
    exit 1
}

Write-Host "✅ GitHub CLI autenticado" -ForegroundColor Green
Write-Host ""

# Obter informações do repositório
$REPO = gh repo view --json nameWithOwner -q .nameWithOwner
Write-Host "📦 Repositório: $REPO" -ForegroundColor Yellow
Write-Host ""

# Configurar SERVER_HOST
$SERVER_HOST = Read-Host "Digite o IP ou hostname do servidor"
gh secret set SERVER_HOST -b "$SERVER_HOST" -R "$REPO"
Write-Host "✅ SERVER_HOST configurado" -ForegroundColor Green

# Configurar SERVER_USER
$SERVER_USER = Read-Host "Digite o usuário SSH do servidor"
gh secret set SERVER_USER -b "$SERVER_USER" -R "$REPO"
Write-Host "✅ SERVER_USER configurado" -ForegroundColor Green

# Configurar SSH_PRIVATE_KEY
Write-Host ""
Write-Host "Para SSH_PRIVATE_KEY, você tem duas opções:" -ForegroundColor Yellow
Write-Host "1. Fornecer caminho para arquivo de chave"
Write-Host "2. Colar chave manualmente"
$SSH_OPTION = Read-Host "Escolha (1/2)"

if ($SSH_OPTION -eq "1") {
    $SSH_KEY_PATH = Read-Host "Digite o caminho completo da chave SSH privada"
    if (Test-Path $SSH_KEY_PATH) {
        Get-Content $SSH_KEY_PATH | gh secret set SSH_PRIVATE_KEY -R "$REPO"
        Write-Host "✅ SSH_PRIVATE_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "❌ Arquivo não encontrado: $SSH_KEY_PATH" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Cole a chave SSH privada completa e pressione Enter duas vezes:" -ForegroundColor Yellow
    $SSH_KEY = @()
    do {
        $line = Read-Host
        if ($line) { $SSH_KEY += $line }
    } while ($line)
    
    $SSH_KEY_TEXT = $SSH_KEY -join "`n"
    $SSH_KEY_TEXT | gh secret set SSH_PRIVATE_KEY -R "$REPO"
    Write-Host "✅ SSH_PRIVATE_KEY configurado" -ForegroundColor Green
}

# Perguntar sobre Docker Registry (opcional)
Write-Host ""
$USE_REGISTRY = Read-Host "Você usa Docker Registry privado? (s/N)"

if ($USE_REGISTRY -eq "s" -or $USE_REGISTRY -eq "S") {
    $DOCKER_USER = Read-Host "Digite o username do Docker Registry"
    gh secret set DOCKER_USERNAME -b "$DOCKER_USER" -R "$REPO"
    
    $DOCKER_PASS = Read-Host "Digite o password/token do Docker Registry" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DOCKER_PASS)
    $DOCKER_PASS_TEXT = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $DOCKER_PASS_TEXT | gh secret set DOCKER_PASSWORD -R "$REPO"
    
    Write-Host "✅ Credenciais do Docker Registry configuradas" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Secrets configurados:" -ForegroundColor Cyan
gh secret list -R "$REPO"

Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Fazer commit e push das mudanças"
Write-Host "2. A pipeline será executada automaticamente"
Write-Host "3. Verificar: https://github.com/$REPO/actions"
