<<<<<<< HEAD
# Copilot Instructions - Controle de Material

## Architecture Overview

**Full-stack inventory control system** with LDAP authentication for Active Directory integration. The system manages materials, tracks stock movements (entrada/saída), and provides dashboard statistics.

### Tech Stack
- **Backend**: Node.js/Express + Prisma ORM + MySQL 8.0
- **Frontend**: React + Vite + TailwindCSS
- **Deployment**: Docker Swarm with Traefik reverse proxy
- **Auth**: JWT tokens + LDAP integration (ldapjs)

### Key Components
- `backend/server.js` - Single-file Express API with all routes (no router separation)
- `backend/src/services/ldap.js` - LDAP authentication service with fallback mode
- `backend/prisma/schema.prisma` - Database schema (Material, Movimentacao, User models)
- `frontend/src/services/api.js` - Centralized fetch wrapper with auth headers
- `docker-compose.yml` - Swarm stack definition with Traefik labels

## Development Workflow

### Starting the Application
```bash
# Development (local)
cd backend && npm run dev  # Uses nodemon
cd frontend && npm run dev  # Vite dev server on port 5173

# Production (Docker Swarm)
docker stack deploy -c docker-compose.yml controle_material
# Traefik routes: estoque.ti.wasion.com.br (frontend), api.estoque.ti.wasion.com.br (backend)
```

### Database Management
```bash
cd backend
npx prisma migrate dev --name descriptive_name  # Create migration
npx prisma migrate deploy                       # Apply in production
npx prisma studio                               # Visual DB browser
```

**Critical**: Migrations run automatically in Docker via `entrypoint.sh` - always test locally first.

### Building Docker Images
```bash
# Backend image (multi-stage with Alpine)
docker build -t controle_material-backend:YYYYMMDD-N ./backend

# Frontend image (Nginx-served static build)
docker build -t controle_material-frontend:YYYYMMDD-N ./frontend
```

Image tags follow pattern `YYYYMMDD-N` (date + increment). Update `docker-compose.yml` with new tags before deployment.

## Project-Specific Patterns

### Authentication Flow
1. **Login via LDAP first**: `AuthController.login` calls `ldapService.authenticate()`
2. **Auto-create local user**: If LDAP succeeds, upsert User in database
3. **JWT token issued**: Contains `userId` and `role` (ADMIN/USER from AD groups)
4. **All API routes protected**: `authMiddleware` validates JWT (except `/auth/*` and `/health`)

**LDAP can be disabled**: Set `LDAP_ENABLED=false` - service returns mock user to allow development without AD.

### API Route Structure
All routes defined inline in `server.js` (no separate router files):
- `GET /materiais` - List all materials with movements
- `POST /movimentacoes` - Record entrada/saída (validates stock, updates quantity atomically)
- `GET /estatisticas` - Dashboard stats (total, baixo estoque, movements today)
- `GET /relatorios/movimentacoes?dataInicio=&dataFim=&tipo=` - Filtered movement reports

**Common pattern**: Include related data with Prisma's `include: { movimentacoes: true }`.

### Frontend API Calls
Use `api.get/post/put/delete/patch` from `src/services/api.js`:
- Auto-adds `Authorization: Bearer <token>` header
- Auto-redirects to login on 401 (expired token)
- Builds URL as `window.location.origin + /api + path` (avoids hardcoded hostnames)

Example:
```javascript
import api from '../services/api';
const materiais = await api.get('/materiais');
await api.post('/movimentacoes', { materialId: 1, tipo: 'saida', quantidade: 5, tecnico: 'João' });
```

### Docker Swarm Specifics
- **Traefik labels** define routing: `traefik.http.routers.backend.rule=Host(...)` 
- **Path prefix stripping**: `/api` prefix removed before reaching backend via `stripPrefix` middleware
- **Health checks**: Backend exposes `/health` endpoint (checks MySQL connection)
- **Volume persistence**: `db_data` volume for MySQL, no backend volumes (stateless)

### Environment Variables
Required in `.env` (root) and `backend/.env`:
```bash
# Database
DATABASE_URL="mysql://user:password@db:3306/controle_material"
MYSQL_ROOT_PASSWORD=strongpassword
MYSQL_DATABASE=controle_material
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# JWT
JWT_SECRET=your-secret-key-here

# LDAP (optional)
LDAP_ENABLED=true
LDAP_URL=ldap://domain-controller:389
LDAP_BASE_DN=OU=TI,DC=domain,DC=local
LDAP_BIND_DN=CN=ServiceAccount,OU=ServiceAccounts,DC=domain,DC=local
LDAP_BIND_PASSWORD=service-password
LDAP_USER_FILTER=(mail={username})
LDAP_SEARCH_ATTRIBUTES=mail,cn,displayName,memberOf
```

**LDAP URL validation**: Service checks format `ldap(s)://host:port` and disables itself if invalid to prevent crashes.

## Common Tasks

### Adding a New Material Field
1. Update `backend/prisma/schema.prisma` (add field to Material model)
2. Run `npx prisma migrate dev --name add_field_name`
3. Update `backend/server.js` POST/PUT routes to handle new field
4. Update frontend forms to include new input

### Adding a New API Route
Add directly to `backend/server.js` after existing routes:
```javascript
app.get("/new-route", async (req, res) => {
  // Route logic
});
```
Place after `app.use(authMiddleware)` if protected, before if public.

### Deploying Updates
1. Build new Docker images with incremented tag
2. Update image tags in `docker-compose.yml`
3. Run `docker stack deploy -c docker-compose.yml controle_material` (updates services)
4. Monitor: `docker service logs controle_material_backend -f`

## CI/CD Pipeline

### GitHub Actions Workflows
- **pipeline.yaml** - Main CI/CD workflow with 6 jobs:
  1. Code quality (ESLint, npm audit, Prisma validation)
  2. Backend build with MySQL test container
  3. Frontend build with artifact upload
  4. Docker build (parallel: backend + frontend) with automatic tagging `YYYYMMDD-COMMIT`
  5. Deploy to local server via SSH/SCP + Docker Swarm
  6. Automatic rollback on failure

- **security-scan.yaml** - Daily Trivy scans + secret detection
- **cleanup.yaml** - Weekly artifact cleanup (>7 days)

### Deploy Flow
1. Push to `main` triggers pipeline
2. Images built and saved as artifacts
3. SCP transfers images to server
4. SSH executes: load images → update compose → `docker stack deploy`
5. Health checks verify services
6. Old images pruned (keep last 3)

### Required Secrets
Configure in GitHub Settings → Secrets:
- `SSH_PRIVATE_KEY` - Server SSH key (use `.github/setup-secrets.ps1` script)
- `SERVER_HOST` - Server IP/hostname
- `SERVER_USER` - SSH username

**Manual deploy**: `gh workflow run pipeline.yaml -f environment=production`

## Known Gotchas

- **Line endings in entrypoint.sh**: Dockerfile runs `sed -i 's/\r$//'` to fix Windows CRLF that breaks Swarm
- **Prisma client generation**: Must run `npx prisma generate` after installing dependencies (handled in entrypoint)
- **No register route used**: LDAP-only auth - local register endpoint exists but unused in production
- **Movimentacao tracking**: Always updates `quantidadeAnterior` and `quantidadeAtual` for audit trail
- **Traefik priority**: Frontend has `priority=10`, backend paths `priority=100` (higher = matched first)
- **Pipeline artifacts**: Kept for 7 days (images) or 30 days (manifests) - cleanup runs weekly
- **Docker cache**: GitHub Actions cache speeds up builds - cleared if cache miss rate >50%
=======
# Copilot Instructions - Controle Material

## Visão Geral do Projeto

Sistema de controle de estoque de materiais com autenticação LDAP corporativa, desenvolvido para ambiente corporativo Wasion America. Stack: **Express.js + Prisma (MySQL) + React + Vite**, executando em **Docker Swarm** com Traefik como reverse proxy.

## Arquitetura

### Estrutura de Serviços (Docker Swarm)
- **Traefik** (reverse proxy, porta 80): Roteia tráfego para frontend/backend
- **Backend** (Express): API REST em `api.estoque.ti.wasion.com.br` ou path `/api`
- **Frontend** (Nginx): SPA React em `estoque.ti.wasion.com.br`
- **MySQL 8.0**: Banco de dados com autenticação via secrets do Swarm

### Autenticação Híbrida (LDAP + Local)
- **Fluxo primário**: LDAP contra Active Directory corporativo (`backend/src/services/ldap.js`)
- **Fallback graceful**: Se LDAP desabilitado/falhar, retorna usuário mock para dev
- Usuários LDAP autenticados são sincronizados automaticamente no banco local (`User` model)
- JWT tokens gerados após autenticação bem-sucedida (válidos por tempo configurado em `jwtConfig`)
- Middleware `authMiddleware` protege todas as rotas exceto `/auth/*` e `/health`

**Importante**: Variáveis LDAP podem conter aspas duplas - função `cleanEnv()` sanitiza valores automaticamente.

### Roteamento e API
- Frontend usa **path-based routing**: `${window.location.origin}/api` (evita dependência de DNS)
- Backend expõe porta 3001 internamente, Traefik mapeia via labels
- Todas as requisições autenticadas incluem header `Authorization: Bearer <token>`
- Erro 401 no frontend → logout automático e redirect para login

## Workflow de Desenvolvimento

### Setup Local
```powershell
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev  # Cria banco SQLite local se DATABASE_URL não configurado

# Frontend
cd frontend
npm install
npm run dev  # Porta padrão Vite: 5173
```

### Deploy Automatizado (GitHub Actions)
Pipeline em `.github/workflows/pipeline.yaml`:
1. Push em `main` → CI/CD executa em self-hosted runner
2. SCP copia código para servidor (10.10.1.222)
3. Build local das imagens Docker (`backend` e `frontend`)
4. Push para registry privado (10.10.1.222:5000)
5. Update dos serviços Swarm sem downtime (`docker service update`)

**Não execute `docker-compose`** - o sistema usa Docker Swarm com secrets externos e overlay network.

### Prisma Migrations
```powershell
# Criar nova migration
npx prisma migrate dev --name descricao_mudanca

# Deploy em produção (automático no entrypoint.sh)
npx prisma migrate deploy
```

Migrations em `backend/prisma/migrations/` - nunca editar arquivos gerados manualmente.

## Convenções do Código

### Backend (Express + Prisma)
- **Rotas REST diretamente em `server.js`** - sem separação em routes/ (padrão do projeto)
- Controllers em `src/controllers/` - apenas `AuthController` atualmente
- Services em `src/services/` - `ldap.js` encapsula lógica LDAP
- Prisma Client em `src/lib/prisma.js` - instância singleton exportada
- Middleware de auth valida JWT e injeta `req.userId` e `req.userRole`

**Exemplo de nova rota protegida:**
```javascript
// Após app.use(authMiddleware)
app.get("/nova-rota", async (req, res) => {
  const userId = req.userId; // Disponível após middleware
  // ... lógica
});
```

### Frontend (React + Vite)
- **Sem TypeScript** - JavaScript puro com PropTypes quando necessário
- Styling: **Tailwind CSS** - todas as classes inline, sem CSS modules
- Hooks customizados em `src/hooks/` - `useAuth.jsx` fornece contexto de autenticação
- Services em `src/services/` - `api.js` (wrapper fetch) e `auth.js` (localStorage tokens)
- Páginas em `src/pages/[NomePagina]/index.jsx` - cada pasta representa uma rota
- Lucide React para ícones (`import { IconName } from 'lucide-react'`)

**Exemplo de chamada API:**
```javascript
import api from '../services/api';

const dados = await api.get('/materiais');
await api.post('/movimentacoes', { materialId, tipo, quantidade });
```

### Banco de Dados (Prisma Schema)
Modelos principais em `backend/prisma/schema.prisma`:
- **Material**: Estoque com `quantidade`, `estoqueMinimo`, `categoria`, `ativo`
- **Movimentacao**: Histórico de entrada/saída com `quantidadeAnterior` e `quantidadeAtual`
- **User**: Usuários sincronizados do LDAP ou criados localmente

Relações: `Movimentacao.materialId → Material.id` (cascade delete)

## Debugging e Troubleshooting

### Verificar Status dos Serviços
```powershell
# Via SSH no servidor
docker service ls
docker service ps controle_estoque_backend --no-trunc
docker service logs controle_estoque_backend --tail 50 -f
```

### Health Check
```powershell
curl http://api.estoque.ti.wasion.com.br/health
# Resposta esperada: {"status":"healthy","database":"connected"}
```

### Logs LDAP Verbosos
Backend imprime logs detalhados de autenticação - buscar por `[LDAP]` nos logs do serviço.

### Regenerar Prisma Client (se schema mudar)
```powershell
cd backend
npx prisma generate
# Ou dentro do container: docker exec -it <container> npx prisma generate
```

## Secrets e Configuração

Secrets gerenciados via Docker Swarm (não em .env em produção):
- `mysql_root_password`, `mysql_user`, `mysql_password`
- `jwt_secret` - usado para assinar tokens JWT
- `ldap_bind_password` - senha da conta de serviço LDAP
- `database_url` - connection string completa do MySQL

**Desenvolvimento local**: Use `.env` no backend com `DATABASE_URL` apontando para SQLite ou MySQL local.

## Regras Críticas

1. **Nunca commite secrets** - use variáveis de ambiente ou Swarm secrets
2. **LDAP_ENABLED=false** em dev local para bypass do Active Directory
3. **Prisma migrations sempre via CLI** - nunca edite SQL manualmente
4. **Frontend API_URL é dinâmico** - não hardcode URLs, usa `window.location.origin`
5. **Usuário não-root no Dockerfile** - mantém security best practices (user `nodejs`)
6. **Entrypoint normaliza line endings** - `sed -i 's/\r$//'` evita erros em Windows/Linux

## Estrutura de Endpoints Principais

```
POST /auth/login           # LDAP + JWT token
POST /auth/register        # Registro local (backup)
GET  /health               # Health check (não autenticado)

GET  /materiais            # Lista materiais com movimentações
POST /materiais            # Cria material
PUT  /materiais/:id        # Atualiza material
DELETE /materiais/:id      # Soft delete (ativo=false)
PATCH /materiais/:id/status # Toggle ativo/inativo

POST /movimentacoes        # Registra entrada/saída
GET  /movimentacoes        # Lista todas (opcional ?limit=N)
GET  /movimentacoes/:id    # Histórico de um material (legacy - use rota abaixo)
GET  /materiais/:id/movimentacoes # Histórico de um material

GET  /estatisticas         # Dashboard: totais, baixo estoque, categorias
GET  /relatorios/movimentacoes # Filtros: dataInicio, dataFim, tipo
```

## Performance e Escalabilidade

- Backend: 1 réplica (stateless, pode escalar horizontalmente)
- Frontend: Nginx serve assets estáticos (cache agressivo possível)
- MySQL: 1 réplica com volume persistente, 2GB memory limit
- Healthchecks: Backend (30s interval), MySQL (10s interval, 15 retries no startup)

## Ferramentas e Comandos Úteis

```powershell
# Rebuild local (dev)
docker build -t backend-local ./backend
docker run -p 3001:3001 --env-file ./backend/.env backend-local

# Visualizar estrutura do Prisma
npx prisma studio  # UI em localhost:5555

# Validar schema sem aplicar
npx prisma migrate dev --create-only

# Reset completo do banco (DEV ONLY!)
npx prisma migrate reset
```
>>>>>>> 800b53815857567fa120736d1bc03fd638e6e971
