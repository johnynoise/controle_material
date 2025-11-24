# 🌊 GitFlow Workflows

Este projeto segue o modelo **GitFlow** com pipelines automatizadas para cada etapa do ciclo de desenvolvimento.

## 📋 Estrutura de Branches

```
main (production)
  ├── release/* (staging)
  │     └── develop (development)
  │           ├── feature/*
  │           └── bugfix/*
  └── hotfix/* (emergency fixes)
```

## 🔄 Workflows Disponíveis

### 1. **pipeline.yaml** - Production (main)
**Trigger**: Push para `main`

**Etapas**:
- ✅ Build das imagens no GitHub Actions
- ✅ Push para registry com tag `:latest`
- ✅ Deploy automático para produção (controle_estoque)
- ✅ Zero downtime deployment

**Ambiente**: `http://estoque.ti.wasion.com.br`

---

### 2. **develop.yaml** - Development (develop)
**Trigger**: Push ou PR para `develop`

**Etapas**:
- ✅ Testes automatizados (backend + frontend)
- ✅ Lint do código
- ✅ Build das imagens com tag `:dev`
- ✅ Deploy para ambiente de desenvolvimento (controle_estoque_dev)

**Ambiente**: `http://dev.estoque.ti.wasion.com.br`

**Banco de dados**: `controle_material_dev` (isolado)

---

### 3. **staging.yaml** - Staging (release/*)
**Trigger**: Push para branches `release/*` ou PR para `main`

**Etapas**:
- ✅ Testes completos
- ✅ Lint obrigatório
- ✅ Security scan (npm audit)
- ✅ Build com tag `:staging`
- ✅ Deploy para ambiente de homologação (controle_estoque_staging)

**Ambiente**: `http://staging.estoque.ti.wasion.com.br`

**Banco de dados**: `controle_material_staging` (cópia de produção)

---

### 4. **hotfix.yaml** - Hotfix (hotfix/*)
**Trigger**: Push para branches `hotfix/*`

**Etapas**:
- ✅ Testes críticos
- ✅ Build rápido com tag `:hotfix-<version>`
- ✅ Push para registry (sem deploy automático)
- ⚠️ **Deploy manual** (por segurança)

**Comando para deploy**:
```bash
docker service update --image 10.10.1.222:5000/controle_material-backend:hotfix-1.0.1 controle_estoque_backend
docker service update --image 10.10.1.222:5000/controle_material-frontend:hotfix-1.0.1 controle_estoque_frontend
```

---

### 5. **pull-request.yaml** - Validação de PRs
**Trigger**: Abertura/atualização de Pull Request

**Etapas**:
- ✅ Validação de código (lint + testes)
- ✅ Test build do Docker (sem push)
- ✅ Security check (vulnerabilidades)
- ✅ Detecção de secrets expostos
- ✅ Comentário automático no PR com status

**Sem deploy** - apenas validação

---

## 🚀 Fluxo de Trabalho

### Feature Development
```bash
# Criar feature branch
git checkout develop
git checkout -b feature/nova-funcionalidade

# Desenvolver...
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin feature/nova-funcionalidade

# Abrir PR para develop
# ➜ Workflow pull-request.yaml roda
# ➜ Após merge: develop.yaml roda e deploya em DEV
```

### Release para Staging
```bash
# Criar release branch
git checkout develop
git checkout -b release/1.2.0

# Ajustes finais...
git push origin release/1.2.0

# ➜ Workflow staging.yaml roda
# ➜ Deploy automático para STAGING
# ➜ QA testa em staging

# Abrir PR para main
# ➜ Validação final
```

### Deploy para Produção
```bash
# Merge do PR release -> main
# ➜ Workflow pipeline.yaml roda
# ➜ Deploy automático para PRODUCTION

# Tag da versão
git tag v1.2.0
git push origin v1.2.0

# Merge de volta para develop
git checkout develop
git merge main
git push origin develop
```

### Hotfix Urgente
```bash
# Criar hotfix direto da main
git checkout main
git checkout -b hotfix/1.2.1

# Corrigir bug crítico...
git add .
git commit -m "fix: corrigir bug crítico de segurança"
git push origin hotfix/1.2.1

# ➜ Workflow hotfix.yaml roda
# ➜ Build automático, mas SEM deploy

# Deploy manual após validação
ssh root@10.10.1.222
docker service update --image 10.10.1.222:5000/controle_material-backend:hotfix-1.2.1 controle_estoque_backend

# Merge para main E develop
git checkout main
git merge hotfix/1.2.1
git push origin main

git checkout develop
git merge hotfix/1.2.1
git push origin develop
```

---

## 🏷️ Convenção de Tags Docker

| Branch | Tag Docker | Deploy |
|--------|-----------|--------|
| `main` | `:latest`, `:sha` | ✅ Automático (Production) |
| `develop` | `:dev`, `:dev-sha` | ✅ Automático (Development) |
| `release/*` | `:staging`, `:staging-sha` | ✅ Automático (Staging) |
| `hotfix/*` | `:hotfix-version`, `:hotfix-sha` | ⚠️ Manual (Production) |
| `feature/*` | - | ❌ Sem deploy |

---

## 📊 Ambientes

| Ambiente | Branch | Stack Name | Database | URL |
|----------|--------|------------|----------|-----|
| **Production** | `main` | `controle_estoque` | `controle_material` | http://estoque.ti.wasion.com.br |
| **Staging** | `release/*` | `controle_estoque_staging` | `controle_material_staging` | http://staging.estoque.ti.wasion.com.br |
| **Development** | `develop` | `controle_estoque_dev` | `controle_material_dev` | http://dev.estoque.ti.wasion.com.br |

---

## 🔒 Secrets Necessários

Configure no GitHub (Settings → Secrets → Actions):

```
SSH_PRIVATE_KEY = chave privada SSH para acesso ao servidor 10.10.1.222
```

---

## 📝 Convenção de Commits

Siga o padrão **Conventional Commits**:

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de comportamento
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

---

## 🛠️ Comandos Úteis

### Ver status dos serviços
```bash
# Production
docker service ls | grep controle_estoque

# Development
docker service ls | grep controle_estoque_dev

# Staging
docker service ls | grep controle_estoque_staging
```

### Ver logs
```bash
docker service logs -f controle_estoque_backend
docker service logs -f controle_estoque_dev_backend
docker service logs -f controle_estoque_staging_backend
```

### Rollback manual
```bash
# Ver histórico de updates
docker service inspect controle_estoque_backend --pretty

# Rollback para versão anterior
docker service rollback controle_estoque_backend
```

### Verificar imagens no registry
```bash
curl http://10.10.1.222:5000/v2/controle_material-backend/tags/list
curl http://10.10.1.222:5000/v2/controle_material-frontend/tags/list
```

---

## 🚨 Troubleshooting

### Workflow falhou - como debugar?
1. Vá em **Actions** no GitHub
2. Clique no workflow que falhou
3. Expanda o step que deu erro
4. Verifique os logs

### Deploy travado?
```bash
# Ver tasks do serviço
docker service ps controle_estoque_backend --no-trunc

# Se houver task em shutdown/failed, forçar update
docker service update --force controle_estoque_backend
```

### Imagem não chegou no registry?
```bash
# No servidor, verificar
curl http://localhost:5000/v2/_catalog

# Ver se daemon.json tem insecure-registries
cat /etc/docker/daemon.json
```

---

## ✅ Checklist de Setup

Antes de usar os workflows, certifique-se:

- [ ] Secret `SSH_PRIVATE_KEY` configurado no GitHub
- [ ] Registry rodando em `10.10.1.222:5000`
- [ ] daemon.json com `insecure-registries` configurado
- [ ] Rede `controle_overlay` criada
- [ ] Docker Secrets criados (mysql, jwt, ldap)
- [ ] Branches `develop`, `main` criadas
- [ ] Traefik configurado para os 3 ambientes (prod, staging, dev)

---

## 📚 Referências

- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [GitHub Actions](https://docs.github.com/en/actions)
