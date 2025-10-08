# API de Recibos Médicos - EndoData

Este documento descreve a API completa de gerenciamento de recibos médicos do sistema EndoData.

## Visão Geral

A API de recibos permite:
- ✅ **CRUD completo** de recibos médicos
- ✅ **Busca avançada** com filtros por período, status e paciente
- ✅ **Relatórios financeiros** mensais automatizados
- ✅ **Cálculo automático** de totais e subtotais
- ✅ **Validação de dados** com DTOs tipados
- ✅ **Paginação** de resultados
- ✅ **Autenticação JWT** obrigatória

## Endpoints Disponíveis

### 1. Criar Recibo
**`POST /receipts`**

Cria um novo recibo médico com itens associados.

**Payload:**
```json
{
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "items": [
    {
      "description": "Consulta médica especializada",
      "quantity": 1,
      "unitPrice": 150.00
    },
    {
      "description": "Exame laboratorial",
      "quantity": 2,
      "unitPrice": 45.00
    }
  ]
}
```

**Resposta (201):**
```json
{
  "id": "rec-uuid-123",
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-uuid-456",
  "status": "pending",
  "totalAmount": 240.00,
  "date": "2025-09-30T10:30:00.000Z",
  "items": [
    {
      "id": "item-uuid-789",
      "description": "Consulta médica especializada",
      "quantity": 1,
      "unitPrice": 150.00,
      "totalPrice": 150.00
    },
    {
      "id": "item-uuid-790",
      "description": "Exame laboratorial",
      "quantity": 2,
      "unitPrice": 45.00,
      "totalPrice": 90.00
    }
  ],
  "patient": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João da Silva",
    "email": "joao@email.com"
  }
}
```

---

### 2. Buscar Recibos por Paciente
**`GET /receipts/patient/:id`**

Retorna todos os recibos de um paciente específico.

**Resposta (200):**
```json
[
  {
    "id": "rec-uuid-123",
    "patientId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "paid",
    "totalAmount": 240.00,
    "date": "2025-09-30T10:30:00.000Z",
    "items": [...],
    "patient": {...}
  }
]
```

---

### 3. Buscar Recibos com Filtros
**`GET /receipts`**

Busca recibos com filtros avançados e paginação.

**Query Parameters:**
- `period`: `day` | `week` | `month` | `year` | `custom`
- `startDate`: Data início (YYYY-MM-DD) - obrigatório se period=custom
- `endDate`: Data fim (YYYY-MM-DD) - obrigatório se period=custom
- `status`: `pending` | `paid` | `cancelled`
- `patientId`: UUID do paciente
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)

**Exemplos de uso:**
```
GET /receipts?period=month&status=pending&page=1&limit=20
GET /receipts?period=custom&startDate=2025-09-01&endDate=2025-09-30
GET /receipts?patientId=123e4567-e89b-12d3-a456-426614174000
```

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "rec-uuid-123",
      "patientId": "123e4567-e89b-12d3-a456-426614174000",
      "status": "pending",
      "totalAmount": 240.00,
      "date": "2025-09-30T10:30:00.000Z",
      "items": [...],
      "patient": {...}
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### 4. Buscar Recibo por ID
**`GET /receipts/:id`**

Retorna os dados completos de um recibo específico.

**Resposta (200):**
```json
{
  "id": "rec-uuid-123",
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-uuid-456",
  "status": "paid",
  "totalAmount": 240.00,
  "date": "2025-09-30T10:30:00.000Z",
  "items": [
    {
      "id": "item-uuid-789",
      "description": "Consulta médica especializada",
      "quantity": 1,
      "unitPrice": 150.00,
      "totalPrice": 150.00
    }
  ],
  "patient": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João da Silva",
    "email": "joao@email.com",
    "cpf": "123.456.789-01"
  }
}
```

---

### 5. Atualizar Recibo
**`PUT /receipts/:id`**

Atualiza completamente um recibo existente.

**Payload:**
```json
{
  "status": "paid",
  "items": [
    {
      "description": "Consulta médica + retorno",
      "quantity": 1,
      "unitPrice": 200.00
    }
  ]
}
```

**Resposta (200):**
```json
{
  "id": "rec-uuid-123",
  "status": "paid",
  "totalAmount": 200.00,
  "items": [
    {
      "id": "item-uuid-new",
      "description": "Consulta médica + retorno",
      "quantity": 1,
      "unitPrice": 200.00,
      "totalPrice": 200.00
    }
  ]
}
```

---

### 6. Remover Recibo
**`DELETE /receipts/:id`**

Remove um recibo do sistema.

**Resposta (204):** Sem conteúdo.

---

### 7. Relatório Mensal
**`GET /receipts/reports/monthly`**

Gera relatório de faturamento mensal com métricas financeiras.

**Query Parameters:**
- `month`: Mês (1-12)
- `year`: Ano

**Exemplo:**
```
GET /receipts/reports/monthly?month=9&year=2025
```

**Resposta (200):**
```json
{
  "month": 9,
  "year": 2025,
  "totalRevenue": 15750.00,
  "totalReceipts": 85,
  "pendingReceipts": 12,
  "paidReceipts": 68,
  "cancelledReceipts": 5,
  "averageReceiptValue": 185.29
}
```

## Status Codes Padrão

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso - Operação realizada |
| `201` | Criado - Recibo criado com sucesso |
| `204` | Sem conteúdo - Recibo removido |
| `400` | Dados inválidos - Validação falhou |
| `401` | Não autorizado - Token JWT inválido |
| `404` | Não encontrado - Recibo/Paciente não existe |
| `500` | Erro interno do servidor |

## Validações e Regras de Negócio

### Criação de Recibos
- ✅ Paciente deve existir no sistema
- ✅ Deve conter pelo menos 1 item
- ✅ Quantidade e preço unitário devem ser positivos
- ✅ Total é calculado automaticamente

### Status dos Recibos
- `pending`: Recibo criado, aguardando pagamento
- `paid`: Recibo pago
- `cancelled`: Recibo cancelado

### Filtros de Período
- `day`: Recibos do dia atual
- `week`: Últimos 7 dias
- `month`: Mês atual
- `year`: Ano atual
- `custom`: Período customizado (requer startDate e endDate)

## Estrutura de Dados

### Receipt (Recibo)
```typescript
{
  id: string;                    // UUID único
  patientId: string;             // ID do paciente
  userId: string;                // ID do usuário que criou
  status: ReceiptStatus;         // Status do recibo
  totalAmount: number;           // Valor total calculado
  date: Date;                    // Data de emissão
  items: ReceiptItem[];          // Itens do recibo
  patient: Patient;              // Dados do paciente
}
```

### ReceiptItem (Item do Recibo)
```typescript
{
  id: string;                    // UUID único
  receiptId: string;             // ID do recibo pai
  description: string;           // Descrição do serviço/produto
  quantity: number;              // Quantidade
  unitPrice: number;             // Preço unitário
  totalPrice: number;            // Total calculado (quantity * unitPrice)
}
```

## Exemplo de Uso Completo

### 1. Criar um recibo
```bash
curl -X POST "https://api.endodata.com/receipts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "pending",
    "items": [
      {
        "description": "Consulta endocrinológica",
        "quantity": 1,
        "unitPrice": 180.00
      }
    ]
  }'
```

### 2. Buscar recibos pendentes do mês
```bash
curl -X GET "https://api.endodata.com/receipts?period=month&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Marcar como pago
```bash
curl -X PUT "https://api.endodata.com/receipts/rec-uuid-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

### 4. Obter relatório mensal
```bash
curl -X GET "https://api.endodata.com/receipts/reports/monthly?month=9&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Recursos Avançados

### 🔄 Paginação Inteligente
- Controle total sobre page/limit
- Total de páginas calculado automaticamente
- Metadados de paginação inclusos

### 📊 Relatórios Financeiros
- Métricas mensais automatizadas
- Receita total, média por recibo
- Distribuição por status de pagamento

### 🔍 Filtros Avançados
- Combinação de múltiplos filtros
- Períodos flexíveis (predefinidos ou customizados)
- Busca por paciente específico

### 🧮 Cálculos Automáticos
- Total do recibo calculado automaticamente
- Total por item baseado em quantidade × preço
- Validações matemáticas integradas

### 🔐 Segurança
- Autenticação JWT obrigatória
- Validação de relacionamentos (paciente existe)
- Sanitização de inputs automática

---

*Documentação gerada automaticamente em 30/09/2025*
*Sistema EndoData v1.0.0*