FROM node:18

WORKDIR /app

# Copiar o código fonte
COPY . .

# Limpar cache e reinstalar dependências
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm run build

# Instalar um servidor web simples
RUN npm install -g serve

EXPOSE 5173

# Servir a aplicação construída
CMD ["serve", "-s", "dist", "-l", "5173"]