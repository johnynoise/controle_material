#!/bin/bash
# Script para verificar serviços existentes no Swarm

echo "=== Listando todos os serviços do Swarm ==="
docker service ls

echo ""
echo "=== Buscando serviços backend ==="
docker service ls --format "{{.Name}}" | grep -i backend

echo ""
echo "=== Buscando serviços frontend ==="
docker service ls --format "{{.Name}}" | grep -i frontend

echo ""
echo "=== Buscando serviços do stack controle_material ==="
docker service ls --format "{{.Name}}" | grep controle

echo ""
echo "=== Listando stacks existentes ==="
docker stack ls
