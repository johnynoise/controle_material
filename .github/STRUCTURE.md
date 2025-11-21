# 📁 Estrutura do Projeto - CI/CD

```
controle_material/
├── .github/
│   ├── workflows/
│   │   ├── pipeline.yaml           # 🚀 Pipeline principal CI/CD
│   │   ├── security-scan.yaml      # 🔒 Scan de segurança diário
│   │   └── cleanup.yaml            # 🧹 Limpeza semanal de artifacts
│   ├── copilot-instructions.md     # 🤖 Instruções para AI agents
│   ├── dependabot.yml              # 📦 Atualização automática de deps
│   ├── PIPELINE.md                 # 📖 Documentação detalhada da pipeline
│   ├── QUICKSTART.md               # ⚡ Guia rápido de setup
│   ├── PULL_REQUEST_TEMPLATE.md    # 📝 Template para PRs
│   ├── setup-secrets.sh            # 🔐 Script Linux para secrets
│   └── setup-secrets.ps1           # 🔐 Script Windows para secrets
│
├── backend/
│   ├── Dockerfile                  # 🐳 Multi-stage build (Alpine)
│   ├── entrypoint.sh               # 🎬 Migrations + start server
│   ├── server.js                   # 🖥️ Express API (single file)
│   ├── prisma/
│   │   ├── schema.prisma           # 📊 Database schema
│   │   └── migrations/             # 🔄 Database migrations
│   └── src/
│       ├── controllers/
│       │   └── AuthController.js   # 🔑 Login/Register logic
│       ├── services/
│       │   └── ldap.js             # 🔐 LDAP authentication
│       ├── middlewares/
│       │   └── auth.js             # 🛡️ JWT middleware
│       └── config/
│           └── auth.js             # ⚙️ JWT config
│
├── frontend/
│   ├── Dockerfile                  # 🐳 Vite build + Nginx serve
│   ├── nginx.conf                  # ⚙️ Nginx configuration
│   ├── vite.config.js              # ⚡ Vite bundler config
│   └── src/
│       ├── App.jsx                 # 📱 Main React component
│       ├── services/
│       │   ├── api.js              # 🌐 Fetch wrapper with auth
│       │   └── auth.js             # 🔑 Auth service
│       ├── hooks/
│       │   └── useAuth.jsx         # 🪝 Auth context hook
│       └── pages/
│           ├── Login/              # 🚪 Login page
│           └── Admin/              # 👤 Admin dashboard
│
├── docker-compose.yml              # 🐋 Swarm stack definition
└── .env                            # 🔒 Environment variables (not in repo)
```

## 🔄 Fluxo de Deploy

```
┌─────────────┐
│  Git Push   │
│   to main   │
└──────┬──────┘
       │
       v
┌─────────────────────────────────────────────────┐
│          GitHub Actions Pipeline                │
├─────────────────────────────────────────────────┤
│                                                  │
│  1️⃣ Code Quality (ESLint, Audit, Prisma)      │
│     ├─ Backend checks                           │
│     └─ Frontend checks                          │
│                                                  │
│  2️⃣ Backend Build                              │
│     ├─ MySQL test container                     │
│     ├─ Prisma generate                          │
│     ├─ Run migrations                           │
│     └─ Syntax validation                        │
│                                                  │
│  3️⃣ Frontend Build                             │
│     ├─ Vite build                               │
│     └─ Upload artifacts                         │
│                                                  │
│  4️⃣ Docker Build (Parallel)                    │
│     ├─ Backend: controle_material-backend:TAG   │
│     ├─ Frontend: controle_material-frontend:TAG │
│     └─ Save as artifacts                        │
│                                                  │
│  5️⃣ Deploy to Server                           │
│     ├─ SCP images → server                      │
│     ├─ SSH: docker load                         │
│     ├─ Update docker-compose.yml                │
│     ├─ docker stack deploy                      │
│     └─ Health check                             │
│                                                  │
│  6️⃣ Rollback (if failure)                      │
│     └─ docker service rollback                  │
│                                                  │
└─────────────────────────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│       Servidor Local (Swarm)         │
├──────────────────────────────────────┤
│                                       │
│  ┌────────────┐  ┌──────────────┐   │
│  │  Traefik   │  │    MySQL     │   │
│  │  (Proxy)   │  │  (Database)  │   │
│  └────┬───────┘  └──────────────┘   │
│       │                              │
│  ┌────┴─────────────────────┐       │
│  │                           │       │
│  v                           v       │
│  ┌──────────┐       ┌──────────┐    │
│  │ Backend  │       │ Frontend │    │
│  │  :3001   │       │   :80    │    │
│  └──────────┘       └──────────┘    │
│                                       │
└──────────────────────────────────────┘
       │
       v
┌──────────────────────────┐
│    URLs Públicas         │
├──────────────────────────┤
│ estoque.ti.wasion.com.br │ → Frontend
│ api.estoque...           │ → Backend
└──────────────────────────┘
```

## 🎨 Tags de Imagem

```
Formato: YYYYMMDD-COMMIT
Exemplo: 20251121-a3f5b2c

controle_material-backend:20251121-a3f5b2c
controle_material-backend:latest

controle_material-frontend:20251121-a3f5b2c
controle_material-frontend:latest
```

## 📊 Artifacts Gerados

| Artifact | Tipo | Retenção | Tamanho Aprox |
|----------|------|----------|---------------|
| `frontend-build` | Build output | 7 dias | ~2-5 MB |
| `docker-image-backend` | Imagem tar | 3 dias | ~200-300 MB |
| `docker-image-frontend` | Imagem tar | 3 dias | ~50-80 MB |
| `manifest-backend` | Metadata | 30 dias | <1 KB |
| `manifest-frontend` | Metadata | 30 dias | <1 KB |

## 🔐 Secrets Necessários

```
GitHub Repository Secrets:
├─ SSH_PRIVATE_KEY       (Chave privada para SSH no servidor)
├─ SERVER_HOST           (IP ou hostname do servidor)
├─ SERVER_USER           (Username SSH)
├─ DOCKER_USERNAME       (Opcional: Docker Hub user)
└─ DOCKER_PASSWORD       (Opcional: Docker Hub token)
```

## 🕐 Schedules

| Workflow | Frequência | Horário (UTC) |
|----------|-----------|---------------|
| `security-scan.yaml` | Diário | 03:00 |
| `cleanup.yaml` | Semanal (Domingo) | 02:00 |
| `dependabot.yml` | Semanal (Segunda) | - |

## 🎯 Comandos Úteis

```bash
# Ver status da pipeline
gh run list --limit 5

# Executar workflow manualmente
gh workflow run pipeline.yaml

# Ver logs em tempo real
gh run watch

# Listar secrets configurados
gh secret list

# SSH no servidor e ver logs
ssh user@server "docker service logs controle_material_backend -f"

# Ver status dos serviços
ssh user@server "docker stack services controle_material"
```

## 🔄 Ciclo de Vida de uma Feature

```
1. Criar branch
   git checkout -b feature/nova-funcionalidade

2. Desenvolver localmente
   cd backend && npm run dev
   cd frontend && npm run dev

3. Commit e push
   git add .
   git commit -m "feat: adiciona nova funcionalidade"
   git push origin feature/nova-funcionalidade

4. Abrir PR (usa template automático)
   gh pr create --fill

5. Pipeline roda automaticamente
   - Code quality checks
   - Build & test
   - (Sem deploy em branch não-main)

6. Merge para main
   gh pr merge --squash

7. Pipeline completa executa
   - Build
   - Test
   - Docker build
   - Deploy automático
   - Health check
   - Notificação de sucesso/falha

8. Verificar em produção
   https://estoque.ti.wasion.com.br
```
