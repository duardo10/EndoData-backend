#!/bin/bash

# Script de teste rápido para as rotas do Dashboard
# EndoData Backend - Dashboard Routes Test

echo "🧪 EndoData Dashboard Routes Test"
echo "=================================="

# Configurações
BASE_URL="http://localhost:3000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MTUyOTM1ZS05MzJlLTRhYzgtOTIxNS05YjQ5ZmNhYjFkYTEiLCJlbWFpbCI6ImRhc2hib2FyZEBmaXhlZC5jb20iLCJuYW1lIjoiRHIuIERhc2hib2FyZCBDb3JyaWdpZG8iLCJpc0FkbWluaXN0cmFkb3IiOmZhbHNlLCJpYXQiOjE3NTkzNDU0MjksImV4cCI6MTc1OTQzMTgyOX0.SyQ42f5o2RWH0ZFpr-yuSCaYFDpZALF8wRgRrI1XvCU"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    
    echo -e "\n${BLUE}📡 Testando: $name${NC}"
    echo "URL: $url"
    
    # Fazer requisição
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    # Extrair status code
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    # Verificar status
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Status: $status_code (esperado: $expected_status)${NC}"
        
        # Verificar se é JSON válido
        if echo "$response_body" | jq . > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Resposta JSON válida${NC}"
            echo "📄 Resposta:"
            echo "$response_body" | jq .
        else
            echo -e "${YELLOW}⚠️  Resposta não é JSON válido${NC}"
            echo "$response_body"
        fi
    else
        echo -e "${RED}❌ Status: $status_code (esperado: $expected_status)${NC}"
        echo "📄 Resposta:"
        echo "$response_body"
    fi
}

# Função para testar erro
test_error() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    
    echo -e "\n${YELLOW}🚫 Testando erro: $name${NC}"
    echo "URL: $url"
    
    # Fazer requisição sem token
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
        -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Erro correto: $status_code${NC}"
    else
        echo -e "${RED}❌ Status inesperado: $status_code (esperado: $expected_status)${NC}"
    fi
}

# Verificar se servidor está rodando
echo -e "\n${BLUE}🔍 Verificando se servidor está rodando...${NC}"
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor está respondendo${NC}"
else
    echo -e "${RED}❌ Servidor não está respondendo em $BASE_URL${NC}"
    echo "Certifique-se de que o servidor está rodando:"
    echo "  npm run start:dev"
    echo "  ou"
    echo "  docker-compose up -d"
    exit 1
fi

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq não está instalado. Instale para formatação JSON:${NC}"
    echo "  sudo apt-get install jq"
    echo ""
fi

echo -e "\n${BLUE}🧪 Iniciando testes dos endpoints...${NC}"

# Teste 1: Dashboard Summary
test_endpoint "Dashboard Summary" "$BASE_URL/dashboard/summary" "200"

# Teste 2: Dashboard Metrics
test_endpoint "Dashboard Metrics" "$BASE_URL/dashboard/metrics" "200"

# Teste 3: Weekly Patients (default)
test_endpoint "Weekly Patients (default)" "$BASE_URL/dashboard/weekly-patients" "200"

# Teste 4: Weekly Patients (custom)
test_endpoint "Weekly Patients (4 semanas)" "$BASE_URL/dashboard/weekly-patients?weeks=4" "200"

# Teste 5: Top Medications (default)
test_endpoint "Top Medications (default)" "$BASE_URL/dashboard/top-medications" "200"

# Teste 6: Top Medications (custom)
test_endpoint "Top Medications (custom)" "$BASE_URL/dashboard/top-medications?limit=5&period=3" "200"

# Teste 7: Monthly Revenue Comparison
test_endpoint "Monthly Revenue Comparison" "$BASE_URL/dashboard/monthly-revenue-comparison" "200"

echo -e "\n${YELLOW}🚫 Testando cenários de erro...${NC}"

# Teste de erro: Sem autenticação
test_error "Sem token de autenticação" "$BASE_URL/dashboard/summary" "401"

# Teste de erro: Parâmetro inválido
test_endpoint "Weeks inválido (0)" "$BASE_URL/dashboard/weekly-patients?weeks=0" "400"
test_endpoint "Weeks inválido (100)" "$BASE_URL/dashboard/weekly-patients?weeks=100" "400"
test_endpoint "Limit inválido (0)" "$BASE_URL/dashboard/top-medications?limit=0" "400"
test_endpoint "Period inválido (30)" "$BASE_URL/dashboard/top-medications?period=30" "400"

echo -e "\n${BLUE}🏁 Resumo dos Testes${NC}"
echo "===================="
echo -e "${GREEN}✅ Endpoints testados: 7${NC}"
echo -e "${YELLOW}🚫 Cenários de erro testados: 6${NC}"
echo ""
echo -e "${BLUE}📚 Para mais informações, consulte:${NC}"
echo "  - Documentação: test/TESTE_ROTAS_DASHBOARD.md"
echo "  - Collection Insomnia: test/insomnia-collection.json"  
echo "  - Testes E2E: test/dashboard.e2e-spec.ts"
echo "  - Swagger UI: $BASE_URL/api"
echo ""
echo -e "${GREEN}🎉 Testes concluídos!${NC}"