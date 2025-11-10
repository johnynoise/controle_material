#!/bin/sh
set -e

# Esperar MySQL ficar disponível
until nc -z db 3306; do
  echo "⌛ Aguardando MySQL..."
  sleep 2
done

echo "✅ MySQL está pronto!"

# Gerar cliente Prisma
echo "🔄 Gerando cliente Prisma..."
npx prisma generate
echo "✅ Cliente Prisma gerado!"

# Aplicar migrations
echo "🔄 Aplicando migrations..."
npx prisma migrate deploy
echo "✅ Migrations aplicadas!"

# Iniciar servidor
echo "🚀 Iniciando servidor..."
exec node server.js