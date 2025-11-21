# 🔧 Troubleshooting Guide - CI/CD Pipeline

## 🚨 Problemas Comuns e Soluções

### 1. Pipeline Falha no Job "code-quality"

#### Sintoma
```
Error: ESLint failed with errors
npm audit found vulnerabilities
```

#### Solução
```bash
# Corrigir problemas de lint
cd frontend
npm run lint -- --fix

# Atualizar dependências vulneráveis
npm audit fix

# Se for vulnerabilidade em dep-dev sem fix:
npm audit fix --force
# ou adicione ao ignore temporariamente
```

---

### 2. Backend Build Falha - MySQL Connection

#### Sintoma
```
Error: P1001: Can't reach database server at `localhost:3306`
Prisma migrate deploy failed
```

#### Solução
```yaml
# Verificar se service MySQL está healthy
# A pipeline já tem health check, mas pode demorar:

services:
  mysql:
    options: >-
      --health-interval=10s
      --health-timeout=5s
      --health-retries=5  # Aumentar se necessário
```

```bash
# Testar localmente com Docker
docker run --name mysql-test \
  -e MYSQL_ROOT_PASSWORD=test \
  -e MYSQL_DATABASE=controle_material_test \
  -p 3306:3306 -d mysql:8.0

# Aguardar inicialização
sleep 20

# Testar conexão
mysql -h 127.0.0.1 -P 3306 -u root -ptest
```

---

### 3. Docker Build Falha - Cache Issues

#### Sintoma
```
Error: failed to solve with frontend dockerfile.v0
error: cache export failed
```

#### Solução
```bash
# Limpar cache do GitHub Actions
gh cache delete --all

# Forçar rebuild sem cache
# Adicionar ao workflow temporariamente:
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
    no-cache: true  # <-- Adicionar
```

---

### 4. Deploy Falha - SSH Connection Refused

#### Sintoma
```
ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection refused
Permission denied (publickey)
```

#### Solução

**Passo 1: Verificar chave SSH**
```bash
# No servidor, verificar authorized_keys
cat ~/.ssh/authorized_keys

# Deve conter a chave pública correspondente
```

**Passo 2: Verificar formato da chave no GitHub**
```bash
# A chave privada deve estar em formato OpenSSH:
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

# Se estiver em formato RSA antigo, converter:
ssh-keygen -p -f ~/.ssh/id_rsa -m pem -P "" -N ""
```

**Passo 3: Testar conexão manual**
```bash
# Salvar chave em arquivo temporário
echo "$SSH_PRIVATE_KEY" > /tmp/test_key
chmod 600 /tmp/test_key

# Testar
ssh -i /tmp/test_key -o StrictHostKeyChecking=no user@host "echo OK"
```

---

### 5. Deploy Falha - Images Not Loading

#### Sintoma
```
Error: failed to load image: open /tmp/backend-image.tar: no such file
```

#### Solução

**Verificar artifacts**
```yaml
# No job deploy, adicionar debug:
- name: List downloaded artifacts
  run: |
    echo "Contents of /tmp:"
    ls -lah /tmp/
    echo "Docker images:"
    ls -lah /tmp/*.tar || echo "No tar files found"
```

**Verificar upload/download**
```yaml
# Garantir que nomes correspondem:
- uses: actions/upload-artifact@v4
  with:
    name: docker-image-backend  # Nome exato

- uses: actions/download-artifact@v4
  with:
    name: docker-image-backend  # Mesmo nome
    path: /tmp/
```

---

### 6. Deploy Falha - Docker Stack Update

#### Sintoma
```
Error: service controle_material_backend: Error response from daemon: 
rpc error: code = InvalidArgument desc = HostConfig is invalid
```

#### Solução

**Verificar docker-compose.yml**
```bash
# Validar sintaxe
docker compose config

# Ver diferenças
git diff HEAD~1 docker-compose.yml
```

**Problemas comuns:**
```yaml
# ❌ Incorreto (Swarm não suporta)
services:
  backend:
    links: [db]  # Remover
    depends_on:  # Remover (Swarm ignora)
      - db

# ✅ Correto
services:
  backend:
    networks:
      - controle_overlay
```

---

### 7. Serviços Não Iniciam Após Deploy

#### Sintoma
```bash
docker service ps controle_material_backend
# Shows: Shutdown / Failed
```

#### Diagnóstico
```bash
# Ver logs detalhados
docker service logs controle_material_backend --tail 100

# Ver tarefas que falharam
docker service ps controle_material_backend --no-trunc

# Inspecionar serviço
docker service inspect controle_material_backend --pretty
```

#### Soluções Comuns

**A. Variáveis de ambiente faltando**
```bash
# Verificar se .env existe no servidor
ls -la /opt/controle_material/.env

# Verificar se está sendo passado corretamente
docker service inspect controle_material_backend | grep -A 20 Env
```

**B. Imagem com tag errada**
```bash
# Listar imagens
docker images | grep controle_material

# Verificar tag no compose vs imagens disponíveis
grep "image:" docker-compose.yml

# Se necessário, forçar pull/load
docker load -i /tmp/backend-image.tar
```

**C. Port binding conflito**
```bash
# Verificar portas em uso
netstat -tlnp | grep 3306
netstat -tlnp | grep 80

# Se ocupadas, parar serviços conflitantes
docker ps -a | grep 3306
```

---

### 8. Rollback Não Funciona

#### Sintoma
```
Error: service has no previous spec version to roll back to
```

#### Solução

**Rollback manual:**
```bash
# SSH no servidor
ssh user@server

# Opção 1: Rollback para versão anterior (se disponível)
docker service update --rollback controle_material_backend

# Opção 2: Deploy específico
# Atualizar docker-compose.yml com tag antiga
sed -i 's/controle_material-backend:20251121-abc123/controle_material-backend:20251120-def456/g' docker-compose.yml

# Redesenhar stack
docker stack deploy -c docker-compose.yml controle_material
```

---

### 9. Health Check Falha Continuamente

#### Sintoma
```
Health check failed after multiple retries
Service keeps restarting
```

#### Diagnóstico
```bash
# Testar health endpoint manualmente
docker exec -it $(docker ps -q -f name=controle_material_backend) sh
wget -O- http://localhost:3001/health

# Ver logs de health check
docker service ps controle_material_backend | grep Health
```

#### Solução
```dockerfile
# Ajustar health check no Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --spider -q http://localhost:3001/health || exit 1

# Ou no docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      start_period: 45s  # Aumentar tempo inicial
      retries: 3
```

---

### 10. Pipeline Muito Lenta

#### Sintoma
```
Pipeline takes >15 minutes to complete
Build jobs timeout
```

#### Otimizações

**A. Cache NPM mais eficiente**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: |
      backend/package-lock.json
      frontend/package-lock.json

# Usar ci ao invés de install
- run: npm ci --prefer-offline
```

**B. Paralelizar mais jobs**
```yaml
# Executar testes em paralelo
jobs:
  test:
    strategy:
      matrix:
        test-group: [unit, integration, e2e]
```

**C. Reduzir tamanho das imagens**
```dockerfile
# Multi-stage builds
# Usar Alpine Linux
# Remover devDependencies
RUN npm ci --only=production
```

---

## 🔍 Comandos de Diagnóstico Úteis

### GitHub Actions
```bash
# Ver runs recentes
gh run list --limit 10

# Ver detalhes de um run específico
gh run view RUN_ID

# Ver logs de job específico
gh run view RUN_ID --log-failed

# Re-executar job que falhou
gh run rerun RUN_ID --failed

# Cancelar run em progresso
gh run cancel RUN_ID
```

### Docker Swarm
```bash
# Status geral
docker stack services controle_material
docker stack ps controle_material

# Logs em tempo real
docker service logs -f controle_material_backend
docker service logs -f --tail 100 controle_material_frontend

# Forçar re-deploy (sem mudanças)
docker service update --force controle_material_backend

# Escalar réplicas
docker service scale controle_material_backend=2
```

### Sistema
```bash
# Espaço em disco
df -h
docker system df

# Memória
free -h
docker stats --no-stream

# Processos Docker
docker ps -a
docker images

# Limpar recursos
docker system prune -af --volumes
```

---

## 📞 Suporte

Se o problema persistir:

1. **Coletar logs**:
   ```bash
   # Pipeline
   gh run view --log > pipeline-logs.txt
   
   # Servidor
   docker service logs controle_material_backend > backend-logs.txt
   docker info > docker-info.txt
   ```

2. **Criar issue**: 
   - GitHub: https://github.com/johnynoise/controle_material/issues
   - Anexar logs coletados
   - Descrever passos para reproduzir

3. **Verificar documentação**:
   - [.github/PIPELINE.md](.github/PIPELINE.md)
   - [.github/STRUCTURE.md](.github/STRUCTURE.md)
