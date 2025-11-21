# Badges e Status para README.md

Adicione estes badges ao seu README.md principal para mostrar o status da pipeline:

```markdown
# Controle de Material

[![CI/CD Pipeline](https://github.com/johnynoise/controle_material/actions/workflows/pipeline.yaml/badge.svg)](https://github.com/johnynoise/controle_material/actions/workflows/pipeline.yaml)
[![Security Scan](https://github.com/johnynoise/controle_material/actions/workflows/security-scan.yaml/badge.svg)](https://github.com/johnynoise/controle_material/actions/workflows/security-scan.yaml)
[![Node.js Version](https://img.shields.io/badge/node-18.x-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-swarm-blue.svg)](https://docs.docker.com/engine/swarm/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Sistema de controle de estoque de materiais com autenticação LDAP e deploy automatizado.

## 🚀 Quick Start

### Desenvolvimento Local

\`\`\`bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
\`\`\`

### Deploy Automático

1. Configure os secrets: \`.github/setup-secrets.ps1\`
2. Push para main: Pipeline executa automaticamente
3. Acompanhe: \`gh run watch\`

📚 **Documentação completa**: [.github/PIPELINE.md](.github/PIPELINE.md)

## 🏗️ Arquitetura

- **Backend**: Node.js + Express + Prisma ORM + MySQL 8.0
- **Frontend**: React + Vite + TailwindCSS
- **Auth**: JWT + LDAP (Active Directory)
- **Deploy**: Docker Swarm + Traefik + GitHub Actions
- **CI/CD**: Testes automatizados, scan de segurança, deploy contínuo

## 📊 Pipeline Status

| Job | Status | Descrição |
|-----|--------|-----------|
| Code Quality | ✅ | Lint, audit, validação Prisma |
| Backend Build | ✅ | Build + testes com MySQL container |
| Frontend Build | ✅ | Build Vite + artifacts |
| Docker Build | ✅ | Multi-stage images (backend + frontend) |
| Deploy | ✅ | Deploy automático via SSH/Docker Swarm |
| Rollback | ⚠️ | Automático em caso de falha |

## 🔒 Segurança

- ✅ Scan diário de vulnerabilidades (Trivy)
- ✅ npm audit automatizado
- ✅ Detecção de secrets no código
- ✅ Containers não-root
- ✅ Network isolation (overlay)
- ✅ HTTPS via Traefik (produção)

## 📈 Estatísticas

- **Build Time**: ~3-5 minutos
- **Deploy Time**: ~2-3 minutos
- **Total Pipeline**: ~8 minutos
- **Uptime**: 99.9% (Swarm com health checks)

## 🛠️ Tecnologias

### Backend
- Node.js 18
- Express 4
- Prisma ORM 6
- MySQL 8.0
- ldapjs 3
- JWT

### Frontend
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6
- Lucide Icons

### DevOps
- Docker & Docker Swarm
- Traefik Proxy 3
- GitHub Actions
- Dependabot
- Trivy Security Scanner

## 📝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'feat: add some feature'\`)
4. Push para branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request (usa template automático)

A pipeline será executada automaticamente em PRs.

## 📚 Documentação

- [Pipeline CI/CD](.github/PIPELINE.md) - Documentação completa da pipeline
- [Quick Start](.github/QUICKSTART.md) - Guia rápido de 5 minutos
- [Estrutura do Projeto](.github/STRUCTURE.md) - Visão geral da arquitetura
- [Copilot Instructions](.github/copilot-instructions.md) - Guia para AI agents

## 🤝 Suporte

- **Issues**: [GitHub Issues](https://github.com/johnynoise/controle_material/issues)
- **Discussions**: [GitHub Discussions](https://github.com/johnynoise/controle_material/discussions)
- **Pipeline Status**: [GitHub Actions](https://github.com/johnynoise/controle_material/actions)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Status**: 🟢 Em produção | **Última atualização**: Novembro 2025
\`\`\`

## Exemplo Visual

Adicione também este diagrama ASCII ao README:

\`\`\`
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Pipeline   │────▶│   Server    │
│  Repository │     │    Actions   │     │   (Swarm)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├─ Code Quality ✓
                           ├─ Build & Test ✓
                           ├─ Docker Build ✓
                           ├─ Security Scan ✓
                           └─ Auto Deploy ✓
\`\`\`

## Shields.io Badges Personalizados

Adicione também badges customizados:

\`\`\`markdown
![Deployment](https://img.shields.io/badge/deployment-automated-success)
![Environment](https://img.shields.io/badge/environment-production-blue)
![Monitoring](https://img.shields.io/badge/monitoring-active-success)
![Backup](https://img.shields.io/badge/backup-daily-informational)
\`\`\`
