#!/bin/sh

set -e

echo "Waiting for MySQL to be ready..."
until mysqladmin ping -h"db" -P"3306" -u"root" -p"$MYSQL_ROOT_PASSWORD" --silent; do
  echo "MySQL is unavailable - sleeping"
  sleep 1
done

echo "MySQL is up - proceeding with initialization"

echo "Running Prisma generate..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting the server..."
exec npm start