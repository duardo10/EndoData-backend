<!--
  Sistema de Prescrições - Documentação da API
  
  Arquivo: PRESCRIPTIONS_API.md
  Descrição: Documentação completa da API de prescrições médicas
  Autor: Sistema EndoData
  Data: 2025-09-24
  Versão: 1.0.0
  
  Este arquivo contém:
  - Documentação de todos os endpoints
  - Exemplos de requisições e respostas
  - Validações e regras de negócio
  - Códigos de erro e suas descrições
  - Fluxos de trabalho típicos
-->

# Sistema de Prescrições - API Documentation

## Visão Geral

O sistema de prescrições permite gerenciar prescrições médicas completas, incluindo os medicamentos associados. Cada prescrição está vinculada a um paciente e a um médico (usuário), e possui um status que controla seu ciclo de vida.

## Status das Prescrições

- `draft` - Rascunho (ainda não finalizada)
- `active` - Ativa (em uso pelo paciente)
- `suspended` - Suspensa (temporariamente pausada)
- `completed` - Concluída (finalizada)

## Endpoints

### 1. Criar Prescrição
**POST** `/prescriptions`

Cria uma nova prescrição médica com medicamentos associados.

**Body:**
```json
{
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001", 
  "status": "active",
  "notes": "Tomar com alimentos para evitar irritação gástrica",
  "medications": [
    {
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3x ao dia",
      "duration": "7 dias"
    },
    {
      "medicationName": "Ibuprofeno",
      "dosage": "400mg", 
      "frequency": "2x ao dia",
      "duration": "5 dias"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "status": "active",
  "notes": "Tomar com alimentos para evitar irritação gástrica",
  "createdAt": "2025-09-24T10:30:00.000Z",
  "patient": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João Silva",
    // ... outros dados do paciente
  },
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Dr. Maria Santos",
    // ... outros dados do médico
  },
  "medications": [
    {
      "id": "med-uuid-1",
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3x ao dia", 
      "duration": "7 dias"
    },
    {
      "id": "med-uuid-2",
      "medicationName": "Ibuprofeno",
      "dosage": "400mg",
      "frequency": "2x ao dia",
      "duration": "5 dias"
    }
  ]
}
```

### 2. Buscar Prescrições por Paciente
**GET** `/prescriptions/patient/{patientId}`

Busca todas as prescrições de um paciente específico, ordenadas por data (mais recentes primeiro).

**Parâmetros:**
- `patientId` (UUID): ID do paciente

**Response (200):**
```json
[
  {
    "id": "prescription-uuid-1",
    "status": "active", 
    "notes": "Tomar com alimentos",
    "createdAt": "2025-09-24T10:30:00.000Z",
    "patient": { /* dados do paciente */ },
    "user": { /* dados do médico */ },
    "medications": [ /* lista de medicamentos */ ]
  },
  {
    "id": "prescription-uuid-2",
    "status": "completed",
    "notes": "Tratamento concluído com sucesso",
    "createdAt": "2025-09-20T08:15:00.000Z",
    "patient": { /* dados do paciente */ },
    "user": { /* dados do médico */ },
    "medications": [ /* lista de medicamentos */ ]
  }
]
```

### 3. Buscar Prescrição por ID
**GET** `/prescriptions/{id}`

Busca uma prescrição específica pelo ID.

**Parâmetros:**
- `id` (UUID): ID da prescrição

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "status": "active",
  "notes": "Tomar com alimentos",
  "createdAt": "2025-09-24T10:30:00.000Z",
  "patient": { /* dados completos do paciente */ },
  "user": { /* dados completos do médico */ },
  "medications": [ /* lista completa de medicamentos */ ]
}
```

### 4. Atualizar Prescrição
**PUT** `/prescriptions/{id}`

Atualiza uma prescrição existente. Permite alterar todos os campos, incluindo medicamentos.

**Parâmetros:**
- `id` (UUID): ID da prescrição

**Body:**
```json
{
  "status": "suspended",
  "notes": "Suspender por 3 dias devido a efeitos adversos",
  "medications": [
    {
      "medicationName": "Paracetamol",
      "dosage": "250mg",
      "frequency": "2x ao dia", 
      "duration": "5 dias"
    }
  ]
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "status": "suspended",
  "notes": "Suspender por 3 dias devido a efeitos adversos",
  "createdAt": "2025-09-24T10:30:00.000Z",
  "patient": { /* dados do paciente */ },
  "user": { /* dados do médico */ },
  "medications": [
    {
      "id": "new-med-uuid",
      "medicationName": "Paracetamol",
      "dosage": "250mg",
      "frequency": "2x ao dia",
      "duration": "5 dias"
    }
  ]
}
```

### 5. Alterar Status da Prescrição
**PATCH** `/prescriptions/{id}/status`

Altera apenas o status de uma prescrição (endpoint otimizado para mudanças de status).

**Parâmetros:**
- `id` (UUID): ID da prescrição

**Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "status": "completed",
  "notes": "Tomar com alimentos",
  "createdAt": "2025-09-24T10:30:00.000Z",
  "patient": { /* dados do paciente */ },
  "user": { /* dados do médico */ },
  "medications": [ /* medicamentos inalterados */ ]
}
```

### 6. Deletar Prescrição
**DELETE** `/prescriptions/{id}`

Remove uma prescrição do sistema (remove também todos os medicamentos associados).

**Parâmetros:**
- `id` (UUID): ID da prescrição

**Response (204):** *(No Content)*

## Validações

### Criação de Prescrição:
- ✅ `patientId` deve ser um UUID válido de paciente existente
- ✅ `userId` deve ser um UUID válido de usuário/médico existente
- ✅ `status` deve ser um valor válido do enum (draft, active, suspended, completed)
- ✅ `medications` deve conter pelo menos 1 medicamento
- ✅ Cada medicamento deve ter: `medicationName`, `dosage`, `frequency`, `duration`

### Atualização de Prescrição:
- ✅ Prescrição deve existir
- ✅ Se `patientId` fornecido, paciente deve existir
- ✅ Se `userId` fornecido, usuário deve existir  
- ✅ Se `medications` fornecidos, deve conter pelo menos 1 item
- ✅ Medicamentos antigos são substituídos pelos novos

### Alteração de Status:
- ✅ Prescrição deve existir
- ✅ Status deve ser válido

## Códigos de Erro

- **400 Bad Request**: Dados inválidos (ex: falta de medicamentos)
- **404 Not Found**: Prescrição, paciente ou usuário não encontrado
- **422 Unprocessable Entity**: Validação de dados falhou

## Fluxo de Trabalho Típico

1. **Criar prescrição** - Médico cria nova prescrição para paciente
2. **Consultar prescrições** - Visualizar histórico do paciente
3. **Alterar status** - Ativar, suspender ou finalizar prescrição
4. **Atualizar prescrição** - Modificar medicamentos ou doses
5. **Finalizar tratamento** - Marcar como concluída

## Segurança

- 🔐 Todos os endpoints requerem autenticação JWT
- 🔐 Validação de UUIDs nos parâmetros de rota
- 🔐 Validação de dados de entrada com class-validator
- 🔐 Relacionamentos protegidos por foreign keys no banco