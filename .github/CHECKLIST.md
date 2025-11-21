# ✅ Pre-Deploy Checklist

Use este checklist antes de fazer deploy em produção.

## 🔐 Segurança

- [ ] Todos os secrets estão configurados no GitHub
  ```bash
  gh secret list
  ```
- [ ] Arquivo `.env` está no servidor (não no repositório)
- [ ] `JWT_SECRET` é forte e único (min 32 caracteres)
- [ ] Credenciais LDAP estão corretas
- [ ] SSH key tem permissões 600
- [ ] Usuário de deploy tem acesso ao Docker
- [ ] Portas sensíveis não estão expostas publicamente
- [ ] Traefik dashboard está protegido ou desabilitado

## 🐳 Docker & Servidor

- [ ] Docker Swarm está inicializado
  ```bash
  docker swarm init
  ```
- [ ] Network overlay está criada
  ```bash
  docker network create --driver overlay controle_overlay
  ```
- [ ] Servidor tem espaço em disco suficiente (min 10GB)
  ```bash
  df -h
  ```
- [ ] MySQL data volume está criado
  ```bash
  docker volume ls | grep db_data
  ```
- [ ] Portas necessárias estão abertas (80, 443, 3306, 3001)
- [ ] Docker compose está validado
  ```bash
  docker compose config
  ```

## 📊 Banco de Dados

- [ ] Backup do banco foi feito (se existir)
  ```bash
  docker exec mysql mysqldump -u root -p controle_material > backup.sql
  ```
- [ ] Migrations foram testadas localmente
  ```bash
  cd backend && npx prisma migrate dev
  ```
- [ ] Schema Prisma está validado
  ```bash
  npx prisma validate
  ```
- [ ] Seeds do banco estão prontos (se necessário)

## 🧪 Testes

- [ ] Backend build passa localmente
  ```bash
  cd backend && npm ci && npm test
  ```
- [ ] Frontend build passa localmente
  ```bash
  cd frontend && npm ci && npm run build
  ```
- [ ] Lint não tem erros
  ```bash
  cd frontend && npm run lint
  ```
- [ ] Não há vulnerabilidades críticas
  ```bash
  npm audit --audit-level=high
  ```
- [ ] Docker images constroem sem erros
  ```bash
  docker build -t test-backend ./backend
  docker build -t test-frontend ./frontend
  ```

## 🌐 Networking

- [ ] DNS está configurado corretamente
  - `estoque.ti.wasion.com.br` → Frontend
  - `api.estoque.ti.wasion.com.br` → Backend
- [ ] Traefik labels estão corretos no docker-compose.yml
- [ ] CORS está configurado se necessário
- [ ] SSL/TLS está configurado (se produção)

## 📝 Documentação

- [ ] `.github/copilot-instructions.md` está atualizado
- [ ] `CHANGELOG.md` foi atualizado (se houver)
- [ ] Versão foi incrementada em `package.json`
- [ ] README tem instruções atualizadas
- [ ] Variáveis de ambiente documentadas

## 🚀 Pipeline

- [ ] Workflow `pipeline.yaml` está na branch main
- [ ] Secrets estão configurados:
  - `SSH_PRIVATE_KEY`
  - `SERVER_HOST`
  - `SERVER_USER`
- [ ] Dependabot está habilitado
- [ ] Branch protection está configurado (opcional)
- [ ] PR template está funcionando

## 📋 Pré-Deploy

Execute estes comandos antes do primeiro deploy:

```bash
# 1. Autenticar no GitHub CLI
gh auth login

# 2. Configurar secrets
cd .github
.\setup-secrets.ps1  # Windows
# ou
./setup-secrets.sh   # Linux

# 3. Preparar servidor
ssh user@server << 'EOF'
  # Criar diretórios
  mkdir -p /opt/controle_material
  mkdir -p /tmp/controle_material
  
  # Inicializar Swarm
  docker swarm init || echo "Swarm já inicializado"
  
  # Criar network
  docker network create --driver overlay controle_overlay || echo "Network já existe"
  
  # Verificar Docker
  docker version
  docker info | grep Swarm
EOF

# 4. Copiar .env para servidor
scp .env user@server:/opt/controle_material/.env

# 5. Testar SSH
ssh user@server "echo 'SSH funcionando!' && docker ps"

# 6. Fazer commit e push
git add .
git commit -m "ci: configure CI/CD pipeline"
git push origin main

# 7. Acompanhar deploy
gh run watch
```

## ✅ Pós-Deploy

Após deploy bem-sucedido, verificar:

- [ ] Frontend está acessível
  ```bash
  curl -I http://estoque.ti.wasion.com.br
  ```
- [ ] Backend responde
  ```bash
  curl http://api.estoque.ti.wasion.com.br/health
  ```
- [ ] Serviços estão rodando
  ```bash
  ssh user@server "docker service ls | grep controle"
  ```
- [ ] Logs não têm erros críticos
  ```bash
  ssh user@server "docker service logs controle_material_backend --tail 50"
  ```
- [ ] Login funciona
  - Testar no browser
  - Verificar LDAP authentication
- [ ] Dashboard carrega dados
- [ ] Operações CRUD funcionam
- [ ] Traefik está roteando corretamente

## 🔄 Rollback Plan

Se algo der errado:

```bash
# Opção 1: Rollback automático (pipeline faz isso)
# A pipeline detecta falhas e executa rollback

# Opção 2: Rollback manual
ssh user@server << 'EOF'
  docker service rollback controle_material_backend
  docker service rollback controle_material_frontend
EOF

# Opção 3: Deploy de versão específica
# 1. Encontrar última tag boa
docker images | grep controle_material

# 2. Atualizar docker-compose.yml
sed -i 's/controle_material-backend:NEW_TAG/controle_material-backend:OLD_TAG/g' docker-compose.yml

# 3. Redesenhar
docker stack deploy -c docker-compose.yml controle_material
```

## 📊 Monitoramento Pós-Deploy

Monitorar por 30 minutos após deploy:

```bash
# Terminal 1: Logs backend
ssh user@server "docker service logs -f controle_material_backend"

# Terminal 2: Logs frontend
ssh user@server "docker service logs -f controle_material_frontend"

# Terminal 3: Status dos serviços
watch -n 10 'ssh user@server "docker service ps controle_material_backend controle_material_frontend"'

# Terminal 4: Recursos do sistema
ssh user@server "docker stats --no-stream"
```

## 🚨 Alertas Críticos

Fique atento a:

- ⚠️ Serviços reiniciando continuamente
- ⚠️ Erros de conexão com MySQL
- ⚠️ Health checks falhando
- ⚠️ Uso de CPU/memória > 80%
- ⚠️ Espaço em disco < 2GB
- ⚠️ Erros 500 no frontend
- ⚠️ Logs mostrando exceptions

## 📞 Contatos de Emergência

- **DevOps Lead**: [Seu Nome/Contato]
- **DBA**: [Contato do responsável pelo banco]
- **Infra**: [Contato do responsável pela infra]

---

## 🎉 Deploy Checklist Summary

```
┌─────────────────────────────────────┐
│     Pre-Deploy Checklist            │
├─────────────────────────────────────┤
│  ✅ Segurança configurada           │
│  ✅ Docker & Servidor preparados    │
│  ✅ Banco de dados pronto           │
│  ✅ Testes passando                 │
│  ✅ Networking configurado          │
│  ✅ Documentação atualizada         │
│  ✅ Pipeline configurada            │
│  ✅ Comandos pré-deploy executados  │
├─────────────────────────────────────┤
│  🚀 PRONTO PARA DEPLOY!             │
└─────────────────────────────────────┘
```

**Última revisão**: 21/11/2025
