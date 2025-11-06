FROM node:18-alpine

WORKDIR /app

# Instalar dependências necessárias
RUN apk add --no-cache python3 make g++

# Instalar Vite globalmente com uma versão específica
RUN npm install -g vite@4.5.0

COPY package*.json ./

# Instalar dependências ignorando scripts e sem instalar pacotes opcionais
RUN npm install --ignore-scripts --no-optional

COPY . .

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

# Usar o Vite global em vez do local
CMD ["vite", "--host", "0.0.0.0"]