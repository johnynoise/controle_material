#!/bin/bash
set -e

# Script para configurar secrets do GitHub Actions
# Execute: ./setup-secrets.sh

echo "🔐 GitHub Actions Secrets Setup"
echo "================================"
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado!"
    echo "Instale: https://cli.github.com/"
    exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
    echo "❌ Você não está autenticado no GitHub CLI"
    echo "Execute: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI autenticado"
echo ""

# Obter informações do repositório
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repositório: $REPO"
echo ""

# Configurar SERVER_HOST
read -p "Digite o IP ou hostname do servidor: " SERVER_HOST
gh secret set SERVER_HOST -b"$SERVER_HOST" -R "$REPO"
echo "✅ SERVER_HOST configurado"

# Configurar SERVER_USER
read -p "Digite o usuário SSH do servidor: " SERVER_USER
gh secret set SERVER_USER -b"$SERVER_USER" -R "$REPO"
echo "✅ SERVER_USER configurado"

# Configurar SSH_PRIVATE_KEY
echo ""
echo "Para SSH_PRIVATE_KEY, você tem duas opções:"
echo "1. Fornecer caminho para arquivo de chave"
echo "2. Colar chave manualmente"
read -p "Escolha (1/2): " SSH_OPTION

if [ "$SSH_OPTION" = "1" ]; then
    read -p "Digite o caminho completo da chave SSH privada: " SSH_KEY_PATH
    if [ -f "$SSH_KEY_PATH" ]; then
        gh secret set SSH_PRIVATE_KEY < "$SSH_KEY_PATH" -R "$REPO"
        echo "✅ SSH_PRIVATE_KEY configurado"
    else
        echo "❌ Arquivo não encontrado: $SSH_KEY_PATH"
        exit 1
    fi
else
    echo "Cole a chave SSH privada (pressione Ctrl+D quando terminar):"
    SSH_KEY=$(cat)
    echo "$SSH_KEY" | gh secret set SSH_PRIVATE_KEY -R "$REPO"
    echo "✅ SSH_PRIVATE_KEY configurado"
fi

# Perguntar sobre Docker Registry (opcional)
echo ""
read -p "Você usa Docker Registry privado? (s/N): " USE_REGISTRY

if [ "$USE_REGISTRY" = "s" ] || [ "$USE_REGISTRY" = "S" ]; then
    read -p "Digite o username do Docker Registry: " DOCKER_USER
    gh secret set DOCKER_USERNAME -b"$DOCKER_USER" -R "$REPO"
    
    read -sp "Digite o password/token do Docker Registry: " DOCKER_PASS
    echo ""
    echo "$DOCKER_PASS" | gh secret set DOCKER_PASSWORD -R "$REPO"
    
    echo "✅ Credenciais do Docker Registry configuradas"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "Secrets configurados:"
gh secret list -R "$REPO"

echo ""
echo "📝 Próximos passos:"
echo "1. Fazer commit e push das mudanças"
echo "2. A pipeline será executada automaticamente"
echo "3. Verificar: https://github.com/$REPO/actions"
