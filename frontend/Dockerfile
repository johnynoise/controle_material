# Etapa 1: Build do frontend
FROM node:18 AS build

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro
COPY package*.json ./

# Instala dependências e pacotes necessários para o build
RUN npm install
RUN npm install @rollup/rollup-linux-x64-gnu

# Copia o restante do código
COPY . .

# Compila o projeto
RUN npm run build

# Etapa 2: Servir com Nginx (imagem leve)
FROM nginx:alpine

# Remove configuração padrão e copia nossa configuração
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Remove site padrão e copia o build gerado
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
