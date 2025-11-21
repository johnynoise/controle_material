# Configuração da Pipeline CI/CD

## 📋 Visão Geral

Pipeline completa de CI/CD para o projeto Controle de Material, com build automatizado, testes, análise de segurança e deploy para servidor local via Docker Swarm.

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub (`Settings > Secrets and variables > Actions`):

### Obrigatórios para Deploy

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `SSH_PRIVATE_KEY` | Chave SSH privada para acesso ao servidor | Conteúdo do arquivo `~/.ssh/id_rsa` |
| `SERVER_HOST` | IP ou hostname do servidor | `192.168.1.100` ou `server.domain.com` |
| `SERVER_USER` | Usuário SSH do servidor | `administrator` ou `deploy` |

### Opcionais (apenas se usar Docker Registry privado)

| Secret | Descrição |
|--------|-----------|
| `DOCKER_USERNAME` | Username do Docker Hub ou registry privado |
| `DOCKER_PASSWORD` | Password ou token de acesso |

## 🛠️ Preparação do Servidor

### 1. Configurar SSH Key

No seu **servidor local**:

```bash
# Gerar par de chaves SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Copiar chave pública para authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# Copiar chave PRIVADA para configurar no GitHub
cat ~/.ssh/id_ed25519
# Cole este conteúdo no secret SSH_PRIVATE_KEY do GitHub
```

### 2. Preparar Diretório de Deploy

```bash
# Criar diretório para deployment
mkdir -p /tmp/controle_material
chmod 755 /tmp/controle_material

# Certificar que o usuário tem permissões no Docker
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Verificar Docker Swarm

```bash
# Inicializar Swarm se ainda não estiver ativo
docker swarm init

# Criar network overlay
docker network create --driver overlay controle_overlay

# Verificar status
docker node ls
docker network ls | grep controle
```

## 🚀 Fluxo da Pipeline

### Pipeline Principal (`pipeline.yaml`)

```mermaid
graph LR
    A[Push/PR] --> B[Code Quality]
    B --> C[Backend Build]
    B --> D[Frontend Build]
    C --> E[Docker Build]
    D --> E
    E --> F[Deploy]
    F -.Falha.-> G[Rollback]
```

#### Etapas:

1. **Code Quality** (Paralelo)
   - ESLint no frontend
   - Audit de segurança (npm audit)
   - Validação do schema Prisma
   - Análise de vulnerabilidades

2. **Backend Build** (Com MySQL test container)
   - Instala dependências
   - Gera Prisma Client
   - Roda migrations
   - Executa testes
   - Valida sintaxe

3. **Frontend Build**
   - Instala dependências
   - Build otimizado (Vite)
   - Gera artifacts
   - Valida output

4. **Docker Build** (Paralelo: backend + frontend)
   - Build com Buildx
   - Cache em GitHub Actions
   - Tag automática: `YYYYMMDD-COMMIT`
   - Salva imagem como artifact

5. **Deploy**
   - Copia imagens via SCP
   - Carrega no Docker local
   - Atualiza docker-compose.yml
   - Deploy via Docker Swarm
   - Health check automático
   - Limpeza de imagens antigas

6. **Rollback** (Se falhar)
   - Reverte serviços automaticamente
   - Usa versão anterior

### Outras Workflows

- **Security Scan** (`security-scan.yaml`)
  - Scan diário com Trivy
  - Verifica dependências vulneráveis
  - Busca secrets no código
  - Upload para GitHub Security

- **Cleanup** (`cleanup.yaml`)
  - Limpa artifacts antigos (>7 dias)
  - Executa semanalmente

## 📊 Monitoramento

### Ver Logs da Pipeline

```bash
# Acessar GitHub Actions
https://github.com/johnynoise/controle_material/actions

# Ver logs no servidor após deploy
docker service logs controle_material_backend -f
docker service logs controle_material_frontend -f
```

### Verificar Status dos Serviços

```bash
# Listar serviços do stack
docker stack services controle_material

# Ver replicas e status
docker service ps controle_material_backend
docker service ps controle_material_frontend

# Inspecionar serviço
docker service inspect controle_material_backend --pretty
```

## 🔄 Deploy Manual

Se precisar fazer deploy manual:

```bash
# Trigger via GitHub UI
# Vá em: Actions > CI/CD Pipeline > Run workflow
# Selecione: environment = production
```

Ou via GitHub CLI:

```bash
gh workflow run pipeline.yaml -f environment=production
```

## 🐛 Troubleshooting

### Pipeline falha no SSH

```bash
# Testar conexão SSH localmente
ssh -i ~/.ssh/id_ed25519 user@server-ip "echo 'SSH OK'"

# Verificar formato da chave no GitHub
# Deve começar com: -----BEGIN OPENSSH PRIVATE KEY-----
```

### Imagens Docker não carregam

```bash
# No servidor, verificar espaço em disco
df -h

# Limpar imagens não usadas
docker system prune -a --volumes
```

### Serviços não sobem após deploy

```bash
# Ver logs detalhados
docker service ps controle_material_backend --no-trunc

# Verificar eventos do Swarm
docker events --since 5m

# Verificar se .env existe
ls -la /path/to/.env
```

### Rollback manual

```bash
# SSH no servidor
ssh user@server-ip

# Rollback individual
docker service rollback controle_material_backend
docker service rollback controle_material_frontend

# Ou remover e redeployar versão anterior
docker stack rm controle_material
# Atualizar docker-compose.yml com tags antigas
docker stack deploy -c docker-compose.yml controle_material
```

## 🔒 Segurança

### Boas Práticas Implementadas

- ✅ Chaves SSH com permissões restritas (600)
- ✅ Secrets nunca expostos em logs
- ✅ Scan de vulnerabilidades automatizado
- ✅ Imagens Docker multi-stage (menor superfície de ataque)
- ✅ Health checks configurados
- ✅ Usuario não-root nos containers
- ✅ Network isolation com overlay

### Recomendações Adicionais

1. **Rotate SSH Keys**: Trocar chaves a cada 90 dias
2. **Enable Branch Protection**: Require PR reviews antes de merge
3. **Configure CODEOWNERS**: Define revisores automáticos
4. **Enable Dependabot**: Já configurado, revisar PRs semanais
5. **Monitor Logs**: Configurar alertas para falhas críticas

## 📈 Melhorias Futuras

- [ ] Adicionar testes E2E (Playwright/Cypress)
- [ ] Implementar blue-green deployment
- [ ] Adicionar smoke tests pós-deploy
- [ ] Configurar notificações (Slack/Discord)
- [ ] Adicionar métricas de performance
- [ ] Implementar canary deployments
- [ ] Adicionar backup automático do DB antes do deploy

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Swarm Docs](https://docs.docker.com/engine/swarm/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Traefik Docs](https://doc.traefik.io/traefik/)
