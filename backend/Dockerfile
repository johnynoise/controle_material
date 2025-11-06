FROM node:18

WORKDIR /app

# Instalar cliente MySQL
RUN apt-get update && \
    apt-get install -y default-mysql-client && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .

EXPOSE 3000

# Script para iniciar a aplicação
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]