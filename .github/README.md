# 📚 Documentação CI/CD - Índice

Documentação completa da pipeline de CI/CD do projeto Controle de Material.

## 🚀 Começando

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| **[QUICKSTART.md](QUICKSTART.md)** | Guia rápido de setup da pipeline | 5 min |
| **[CHECKLIST.md](CHECKLIST.md)** | Checklist completo antes do deploy | 10 min |
| **[setup-secrets.ps1](setup-secrets.ps1)** | Script para configurar secrets (Windows) | 2 min |
| **[setup-secrets.sh](setup-secrets.sh)** | Script para configurar secrets (Linux) | 2 min |

## 📖 Referência

| Documento | Descrição |
|-----------|-----------|
| **[PIPELINE.md](PIPELINE.md)** | Documentação completa da pipeline CI/CD |
| **[STRUCTURE.md](STRUCTURE.md)** | Estrutura do projeto e fluxo de deploy |
| **[DIAGRAMS.md](DIAGRAMS.md)** | Diagramas visuais da arquitetura |
| **[copilot-instructions.md](copilot-instructions.md)** | Instruções para AI coding agents |

## 🔧 Manutenção

| Documento | Descrição |
|-----------|-----------|
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Guia de resolução de problemas |
| **[BADGES.md](BADGES.md)** | Badges e status para README |
| **[PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md)** | Template para Pull Requests |

## ⚙️ Configuração

| Arquivo | Descrição |
|---------|-----------|
| **[dependabot.yml](dependabot.yml)** | Atualização automática de dependências |
| **[workflows/pipeline.yaml](workflows/pipeline.yaml)** | Pipeline principal de CI/CD |
| **[workflows/security-scan.yaml](workflows/security-scan.yaml)** | Scan de segurança diário |
| **[workflows/cleanup.yaml](workflows/cleanup.yaml)** | Limpeza de artifacts semanal |

---

## 📋 Fluxo de Trabalho Recomendado

### Para Novos Desenvolvedores

1. Ler **[QUICKSTART.md](QUICKSTART.md)** (5 min)
2. Executar **setup-secrets** para configurar ambiente
3. Ler **[copilot-instructions.md](copilot-instructions.md)** para entender arquitetura
4. Fazer primeiro commit e ver pipeline em ação

### Para Deploy em Produção

1. Revisar **[CHECKLIST.md](CHECKLIST.md)**
2. Seguir passos do **[PIPELINE.md](PIPELINE.md)**
3. Monitorar usando comandos do **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
4. Se problemas, consultar seção relevante no troubleshooting

### Para Manutenção

1. Monitorar GitHub Actions diariamente
2. Revisar PRs do Dependabot semanalmente
3. Verificar logs de security scan
4. Atualizar documentação quando necessário

---

## 🎯 Documentação por Persona

### 👨‍💻 Desenvolvedor Frontend
- [copilot-instructions.md](copilot-instructions.md) - Seção "Frontend API Calls"
- [STRUCTURE.md](STRUCTURE.md) - Estrutura do frontend
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Seção de build do frontend

### 👨‍💻 Desenvolvedor Backend
- [copilot-instructions.md](copilot-instructions.md) - Seção "API Route Structure"
- [STRUCTURE.md](STRUCTURE.md) - Estrutura do backend
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Seção de build do backend

### 🛠️ DevOps / SRE
- [PIPELINE.md](PIPELINE.md) - Documentação completa
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Todos os problemas de deploy
- [CHECKLIST.md](CHECKLIST.md) - Checklist de infraestrutura

### 🔒 Segurança
- [workflows/security-scan.yaml](workflows/security-scan.yaml) - Configuração de scans
- [PIPELINE.md](PIPELINE.md) - Seção de segurança
- [dependabot.yml](dependabot.yml) - Atualização de dependências

---

## 📊 Status da Documentação

| Documento | Status | Última Atualização |
|-----------|--------|-------------------|
| QUICKSTART.md | ✅ Completo | 21/11/2025 |
| PIPELINE.md | ✅ Completo | 21/11/2025 |
| STRUCTURE.md | ✅ Completo | 21/11/2025 |
| TROUBLESHOOTING.md | ✅ Completo | 21/11/2025 |
| CHECKLIST.md | ✅ Completo | 21/11/2025 |
| copilot-instructions.md | ✅ Completo | 21/11/2025 |
| BADGES.md | ✅ Completo | 21/11/2025 |

---

## 🔗 Links Úteis

### GitHub
- [Repository](https://github.com/johnynoise/controle_material)
- [Actions](https://github.com/johnynoise/controle_material/actions)
- [Issues](https://github.com/johnynoise/controle_material/issues)
- [Pull Requests](https://github.com/johnynoise/controle_material/pulls)

### Documentação Externa
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Traefik](https://doc.traefik.io/traefik/)
- [Prisma](https://www.prisma.io/docs)

### Ferramentas
- [GitHub CLI](https://cli.github.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)

---

## 📞 Suporte

Precisa de ajuda?

1. **Consulte a documentação** acima
2. **Procure em [Issues](https://github.com/johnynoise/controle_material/issues)**
3. **Abra nova issue** se não encontrar solução
4. **Entre em contato** com o time de DevOps

---

## 🤝 Contribuindo para a Documentação

Encontrou algo desatualizado ou faltando?

1. Edite o arquivo relevante
2. Atualize este índice se necessário
3. Abra Pull Request com descrição clara
4. Use o template em [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md)

---

**Versão da Documentação**: 1.0.0  
**Última Atualização**: 21 de Novembro de 2025  
**Mantenedor**: @johnynoise
