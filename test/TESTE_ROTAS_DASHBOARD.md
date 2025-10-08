# Guia de Testes das Rotas do Dashboard - EndoData Backend

Este documento contém instruções completas para testar todas as rotas do dashboard usando diferentes métodos.

## 📋 Pré-requisitos

1. **Servidor rodando**: Certifique-se de que o servidor NestJS está executando
2. **Token JWT**: Você precisa de um token JWT válido para autenticação
3. **Banco de dados**: Banco PostgreSQL configurado e populado com dados de teste

## 🚀 Iniciando o Servidor

**🐳 RECOMENDADO: Usar Docker**
```bash
# Subir todos os serviços (PostgreSQL + Backend + pgAdmin)
docker-compose up -d

# Verificar se os containers estão rodando
docker ps

# Ver logs do backend
docker logs nestjs_backend -f
```

**Desenvolvimento Local (alternativo):**
```bash
# Desenvolvimento (necessita PostgreSQL local)
npm run start:dev

# Produção
npm run start:prod
```

**URLs Disponíveis:**
- **Backend**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs  
- **pgAdmin**: http://localhost:8080

## 🔑 Obtendo Token de Autenticação

### Passo 1: Criar um usuário de teste (se necessário)

```bash
# Criar usuário para teste do dashboard
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Dr. Dashboard Teste",
    "email": "dashboard@teste.com",
    "cpf": "123.456.789-00",
    "crm": "123456",
    "especialidade": "Endocrinologia", 
    "senha": "Teste123!",
    "isAdministrador": false
  }'
```

### Passo 2: Fazer login para obter o token

```bash
# Login para obter token JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dashboard@teste.com",
    "password": "Teste123!"
  }'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "dashboard@teste.com",
    "name": "Dr. Dashboard Teste"
  }
}
```

### 🚨 **TOKEN ATUAL VÁLIDO PARA TESTES:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MTUyOTM1ZS05MzJlLTRhYzgtOTIxNS05YjQ5ZmNhYjFkYTEiLCJlbWFpbCI6ImRhc2hib2FyZEBmaXhlZC5jb20iLCJuYW1lIjoiRHIuIERhc2hib2FyZCBDb3JyaWdpZG8iLCJpc0FkbWluaXN0cmFkb3IiOmZhbHNlLCJpYXQiOjE3NTkzNDU0MjksImV4cCI6MTc1OTQzMTgyOX0.SyQ42f5o2RWH0ZFpr-yuSCaYFDpZALF8wRgRrI1XvCU
```
  }
}
```

**⚠️ IMPORTANTE**: Copie o `access_token` e use nas próximas requisições.

## 📊 Testando Endpoints do Dashboard

### 1. Dashboard Summary - Estatísticas Básicas

**Endpoint:** `GET /dashboard/summary`

```bash
# Teste básico
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "totalPatients": 42,
  "patientsRegisteredToday": 3,
  "patientsRegisteredThisWeek": 11
}
```

**Testes de erro:**
```bash
# Sem token (deve retornar 401)
curl -X GET http://localhost:3000/api/dashboard/summary

# Token inválido (deve retornar 401)
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer token_invalido"
```

### 2. Dashboard Metrics - Métricas Avançadas

**Endpoint:** `GET /dashboard/metrics`

```bash
# Teste básico
curl -X GET http://localhost:3000/api/dashboard/metrics \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "totalPatients": 127,
  "monthlyRevenue": 18750.50,
  "activePrescriptions": 89,
  "averageReceiptValue": 215.73
}
```

### 3. Weekly Patients Chart - Gráfico Semanal

**Endpoint:** `GET /dashboard/weekly-patients`

```bash
# Teste com parâmetros padrão (8 semanas)
curl -X GET http://localhost:3000/api/dashboard/weekly-patients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"

# Teste com 4 semanas
curl -X GET "http://localhost:3000/api/dashboard/weekly-patients?weeks=4" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"

# Teste com 12 semanas
curl -X GET "http://localhost:3000/api/dashboard/weekly-patients?weeks=12" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "data": [
    {
      "weekStart": "2025-09-02",
      "weekEnd": "2025-09-08",
      "newPatients": 7,
      "weekLabel": "02/09 - 08/09"
    }
  ],
  "totalWeeks": 8,
  "generatedAt": "2025-10-01T10:30:00Z"
}
```

**Testes de erro:**
```bash
# Parâmetro weeks inválido (deve retornar 400)
curl -X GET "http://localhost:3000/api/dashboard/weekly-patients?weeks=0" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

curl -X GET "http://localhost:3000/api/dashboard/weekly-patients?weeks=100" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

curl -X GET "http://localhost:3000/api/dashboard/weekly-patients?weeks=abc" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Top Medications - Medicamentos Mais Prescritos

**Endpoint:** `GET /dashboard/top-medications`

```bash
# Teste com parâmetros padrão (10 medicamentos, 6 meses)
curl -X GET http://localhost:3000/api/dashboard/top-medications \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"

# Teste com 5 medicamentos dos últimos 3 meses
curl -X GET "http://localhost:3000/api/dashboard/top-medications?limit=5&period=3" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"

# Teste com 15 medicamentos do último ano
curl -X GET "http://localhost:3000/api/dashboard/top-medications?limit=15&period=12" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "medications": [
    {
      "medicationName": "Paracetamol",
      "prescriptionCount": 45,
      "percentage": 12.5
    },
    {
      "medicationName": "Ibuprofeno",
      "prescriptionCount": 38,
      "percentage": 10.6
    }
  ],
  "totalPrescriptions": 360,
  "period": "Últimos 6 meses",
  "generatedAt": "2025-10-01T10:30:00Z"
}
```

**Testes de erro:**
```bash
# Parâmetros inválidos (devem retornar 400)
curl -X GET "http://localhost:3000/api/dashboard/top-medications?limit=0" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

curl -X GET "http://localhost:3000/api/dashboard/top-medications?limit=100" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

curl -X GET "http://localhost:3000/api/dashboard/top-medications?period=0" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

curl -X GET "http://localhost:3000/api/dashboard/top-medications?period=30" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Monthly Revenue Comparison - Comparação de Receita Mensal

**Endpoint:** `GET /dashboard/monthly-revenue-comparison`

```bash
# Teste básico
curl -X GET http://localhost:3000/api/dashboard/monthly-revenue-comparison \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "currentMonthRevenue": 15750.50,
  "previousMonthRevenue": 12450.00,
  "absoluteDifference": 3300.50,
  "percentageChange": 26.5,
  "trend": "Crescimento",
  "currentMonthName": "Outubro 2025",
  "previousMonthName": "Setembro 2025",
  "currentMonthReceiptCount": 87,
  "previousMonthReceiptCount": 69,
  "currentMonthAverageReceipt": 181.04,
  "previousMonthAverageReceipt": 180.43,
  "generatedAt": "2025-10-01T10:30:00Z"
}
```

## 🔧 Ferramentas de Teste

### 1. Script de Teste Rápido

Execute o script automatizado para testar todas as rotas:

```bash
# Torna o script executável e executa
chmod +x test/test-dashboard-routes.sh
./test/test-dashboard-routes.sh
```

O script testará automaticamente:
- ✅ Todas as 5 rotas do dashboard
- ✅ Cenários de erro (401, 400)
- ✅ Validação de parâmetros
- ✅ Formatação JSON das respostas

### 2. Insomnia/Postman

**Importar Collection:**
1. Abra o Insomnia/Postman
2. Importe o arquivo: `test/insomnia-collection.json`
3. Configure o environment com:
   - `base_url`: http://localhost:3000/api
   - `auth_token`: Seu token JWT

### 3. Swagger UI

Acesse a documentação interativa em: `http://localhost:3000/api/docs`

1. Clique em "Authorize"
2. Insira: `Bearer SEU_TOKEN_AQUI`
3. Teste diretamente pela interface

### 4. Scripts Personalizados

```bash
#!/bin/bash
# script-teste-dashboard.sh

TOKEN="SEU_TOKEN_AQUI"
BASE_URL="http://localhost:3000"

echo "🧪 Testando Dashboard Endpoints..."

echo "📊 1. Testing Summary..."
curl -s -X GET "$BASE_URL/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "📈 2. Testing Metrics..."
curl -s -X GET "$BASE_URL/dashboard/metrics" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "📅 3. Testing Weekly Patients..."
curl -s -X GET "$BASE_URL/dashboard/weekly-patients?weeks=4" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "💊 4. Testing Top Medications..."
curl -s -X GET "$BASE_URL/dashboard/top-medications?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "💰 5. Testing Revenue Comparison..."
curl -s -X GET "$BASE_URL/dashboard/monthly-revenue-comparison" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "✅ Testes concluídos!"
```

**Para usar o script:**
```bash
chmod +x script-teste-dashboard.sh
./script-teste-dashboard.sh
```

## 🔍 Testando Cache

### Verificar Cache Funcionando

```bash
# Primeira requisição (sem cache)
time curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Segunda requisição (com cache - deve ser mais rápida)
time curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Testar Isolamento de Cache por Usuário

```bash
# Token do usuário 1
TOKEN_USER1="token_usuario_1"

# Token do usuário 2  
TOKEN_USER2="token_usuario_2"

# Requisição usuário 1
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN_USER1"

# Requisição usuário 2 (deve ter dados diferentes)
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN_USER2"
```

## 📊 Monitoramento e Debug

### Logs do Servidor

```bash
# Verificar logs em tempo real
docker-compose logs -f backend

# Ou se rodando localmente
npm run start:dev
```

### Verificar Status da API

```bash
# Health check
curl -X GET http://localhost:3000/api/health

# Verificar se o servidor está respondendo
curl -I http://localhost:3000
```

## ❗ Troubleshooting

### Problemas Comuns

1. **401 Unauthorized**
   - Verificar se o token JWT está correto
   - Verificar se o token não expirou
   - Verificar formato: `Bearer TOKEN`

2. **400 Bad Request**
   - Verificar parâmetros enviados
   - Verificar tipos de dados (números como string)
   - Verificar limites dos parâmetros

3. **500 Internal Server Error**
   - Verificar logs do servidor
   - Verificar conexão com banco de dados
   - Verificar se entidades estão corretamente configuradas

4. **Cache não funcionando**
   - Verificar se CacheModule está importado
   - Verificar logs de cache
   - Verificar configuração TTL

### Comandos de Debug

```bash
# Verificar se porta está disponível
netstat -tulpn | grep :3000

# Verificar processo do Node.js
ps aux | grep node

# Verificar conectividade com banco
curl -X GET http://localhost:3000/api/health
```

## 🎯 Checklist de Testes

### ✅ Testes Funcionais

- [ ] Todos os endpoints retornam dados válidos
- [ ] Autenticação funciona corretamente
- [ ] Parâmetros opcionais funcionam
- [ ] Validação de parâmetros funciona
- [ ] Respostas de erro estão corretas

### ✅ Testes de Performance

- [ ] Cache está funcionando (1 hora TTL)
- [ ] Respostas são rápidas (< 100ms com cache)
- [ ] Isolamento de cache por usuário funciona
- [ ] Não há vazamentos de memória

### ✅ Testes de Segurança

- [ ] Dados isolados por usuário
- [ ] Token JWT obrigatório
- [ ] Não há acesso cruzado entre usuários
- [ ] Parâmetros são validados

### ✅ Testes de Documentação

- [ ] Swagger UI carrega corretamente
- [ ] Todas as rotas estão documentadas
- [ ] Exemplos funcionam
- [ ] DTOs estão tipados corretamente

---

**📝 Nota**: Substitua `SEU_TOKEN_AQUI` pelo token JWT real obtido no login.

**🔗 Links Úteis**:
- **Swagger UI**: http://localhost:3000/api/docs
- **Backend API**: http://localhost:3000/api
- **Collection Insomnia**: `test/insomnia-collection.json`
- **Script de Teste**: `test/test-dashboard-routes.sh`