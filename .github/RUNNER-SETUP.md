# 🏃 Configuração do GitHub Actions Self-Hosted Runner

## Por que Self-Hosted Runner?

O pipeline precisa acessar recursos da rede privada corporativa:
- **Servidor de deploy**: 10.10.1.222 (SSH/SCP)
- **Docker Registry**: 10.10.1.222:5000
- **MySQL/LDAP**: Recursos internos da Wasion America

GitHub Actions cloud runners não têm acesso à rede privada, por isso usamos um runner local.

---

## 🔧 Pré-requisitos

Máquina Windows/Linux na rede 10.10.1.x com:
- Docker instalado
- Git instalado
- Acesso SSH ao servidor 10.10.1.222
- Conectividade com registry 10.10.1.222:5000

---

## 📦 Instalação do Runner

### 1️⃣ Acessar Configurações do Repositório

```
https://github.com/<seu-usuario>/controle_material/settings/actions/runners
```

Clique em: **"New self-hosted runner"**

### 2️⃣ Escolher Plataforma

Selecione:
- **Linux** (se servidor Linux)
- **Windows** (se workstation Windows)

### 3️⃣ Baixar e Configurar (Linux)

```bash
# Criar diretório do runner
mkdir actions-runner && cd actions-runner

# Baixar última versão (exemplo)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extrair
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configurar (use o comando gerado pela página do GitHub)
./config.sh --url https://github.com/<seu-usuario>/controle_material \
  --token <TOKEN_GERADO_PELO_GITHUB>

# Quando perguntado:
# - Runner group: Default
# - Name: [deixe padrão ou escolha nome descritivo]
# - Labels: [deixe padrão]
# - Work folder: [deixe padrão _work]
```

### 3️⃣ Baixar e Configurar (Windows)

```powershell
# Criar diretório do runner
mkdir actions-runner; cd actions-runner

# Baixar última versão (exemplo)
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip `
  -OutFile actions-runner-win-x64-2.311.0.zip

# Extrair
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD/actions-runner-win-x64-2.311.0.zip", "$PWD")

# Configurar (use o comando gerado pela página do GitHub)
.\config.cmd --url https://github.com/<seu-usuario>/controle_material `
  --token <TOKEN_GERADO_PELO_GITHUB>
```

---

## 🚀 Iniciar o Runner

### Execução Manual (Teste)

**Linux:**
```bash
./run.sh
```

**Windows:**
```powershell
.\run.cmd
```

### Execução como Serviço (Recomendado)

**Linux (systemd):**
```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

**Windows (como serviço):**
```powershell
# Executar como Administrator
.\svc.cmd install
.\svc.cmd start
.\svc.cmd status
```

---

## ✅ Verificar Instalação

1. Acesse: `https://github.com/<seu-usuario>/controle_material/settings/actions/runners`
2. Você deve ver o runner com status **🟢 Idle** (ou "Online")

---

## 🔐 Configurar SSH (se necessário)

Se o runner precisa acessar 10.10.1.222 via SSH:

```bash
# Gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "github-runner"

# Copiar chave pública para servidor
ssh-copy-id root@10.10.1.222

# Testar conexão
ssh -o StrictHostKeyChecking=no root@10.10.1.222 "echo 'SSH OK'"
```

**IMPORTANTE**: O pipeline usa SSH/SCP direto (não via secrets), então a máquina do runner deve ter autenticação SSH configurada.

---

## 📊 Logs e Troubleshooting

### Ver Logs do Runner

**Linux (systemd):**
```bash
sudo journalctl -u actions.runner.<nome-do-runner>.service -f
```

**Windows (Event Viewer):**
```
Applications and Services Logs → GitHub Actions Runner
```

### Verificar Conectividade

```bash
# Testar SSH
ssh root@10.10.1.222 "docker ps"

# Testar Registry
curl http://10.10.1.222:5000/v2/_catalog

# Testar Docker
docker info
```

### Problemas Comuns

#### ❌ Runner offline após reiniciar máquina

**Solução**: Instalar como serviço (veja seção acima)

#### ❌ Erro "docker: command not found"

**Solução**: Adicionar Docker ao PATH do runner

**Linux:**
```bash
# Editar ~/.bashrc do usuário que executa runner
export PATH=$PATH:/usr/bin:/usr/local/bin
```

**Windows:**
```powershell
# Adicionar Docker ao PATH do sistema
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Docker\Docker\resources\bin", "Machine")
```

#### ❌ Erro "Permission denied" no Docker

**Solução Linux**: Adicionar usuário do runner ao grupo docker
```bash
sudo usermod -aG docker $USER
# Reiniciar runner
```

**Solução Windows**: Executar runner como Administrator

---

## 🔄 Atualizar Runner

```bash
# Parar serviço
sudo ./svc.sh stop  # Linux
.\svc.cmd stop      # Windows

# Baixar nova versão
# (mesmo processo de instalação)

# Reconfigurar se necessário
./config.sh remove --token <TOKEN>
./config.sh --url <URL> --token <NOVO_TOKEN>

# Reiniciar
sudo ./svc.sh start  # Linux
.\svc.cmd start      # Windows
```

---

## 🗑️ Remover Runner

```bash
# Parar serviço
sudo ./svc.sh stop  # Linux
.\svc.cmd stop      # Windows

# Desinstalar serviço
sudo ./svc.sh uninstall  # Linux
.\svc.cmd uninstall      # Windows

# Remover do GitHub
./config.sh remove --token <TOKEN>

# Deletar diretório
cd ..
rm -rf actions-runner
```

---

## 📌 Checklist Pós-Instalação

- [ ] Runner aparece como **🟢 Idle** no GitHub
- [ ] SSH para 10.10.1.222 funciona sem senha
- [ ] `docker ps` executa sem erros
- [ ] Registry 10.10.1.222:5000 está acessível
- [ ] Runner configurado como serviço (inicia com o sistema)
- [ ] Pipeline de teste executou com sucesso

---

## 🎯 Próximos Passos

Após instalar o runner:

1. Commit e push de qualquer alteração para testar
2. Acompanhar execução em: `https://github.com/<seu-usuario>/controle_material/actions`
3. Verificar logs do runner se houver problemas

**Lembre-se**: O runner precisa estar **sempre online** para executar pipelines automaticamente!
