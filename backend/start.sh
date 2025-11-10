#!/bin/sh

# Habilita modo de erro
set -e

# Função para verificar MySQL usando nc
check_mysql() {
  nc -z db 3306 || return 1
}

# Espera MySQL ficar disponível
echo "⏳ Aguardando MySQL ficar disponível..."
RETRIES=30
until check_mysql || [ $RETRIES -eq 0 ]; do
  echo "⌛ MySQL indisponível - tentativa $((30-RETRIES+1)) de 30"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ Timeout aguardando MySQL"
  exit 1
fi

echo "✅ MySQL está pronto!"

# Gera cliente Prisma
echo "🔄 Gerando cliente Prisma..."
npx prisma generate
echo "✅ Cliente Prisma gerado!"

# Aplica migrations
echo "🔄 Aplicando migrations..."
npx prisma migrate deploy
echo "✅ Migrations aplicadas!"

# Inicia o servidor
echo "🚀 Iniciando servidor..."
exec node server.js