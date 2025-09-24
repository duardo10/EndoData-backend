# Sistema de Busca de Pacientes

Este documento apresenta exemplos de uso do sistema de busca de pacientes implementado no EndoData.

## Endpoint de Busca

**GET** `/patients/search`

## Parâmetros de Busca

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `name` | string | Nome do paciente (busca parcial) | `João` |
| `cpf` | string | CPF do paciente (busca exata) | `12345678900` |
| `minAge` | number | Idade mínima | `18` |
| `maxAge` | number | Idade máxima | `65` |
| `gender` | enum | Gênero do paciente | `male`, `female`, `other` |
| `page` | number | Página (padrão: 1) | `1` |
| `limit` | number | Limite por página (padrão: 10) | `20` |

## Exemplos de Uso

### 1. Buscar por nome
```bash
GET /patients/search?name=João
```

### 2. Buscar por CPF
```bash
GET /patients/search?cpf=12345678900
```

### 3. Buscar por faixa etária
```bash
GET /patients/search?minAge=18&maxAge=65
```

### 4. Buscar por gênero
```bash
GET /patients/search?gender=male
```

### 5. Busca combinada
```bash
GET /patients/search?name=João&minAge=18&maxAge=65&gender=male
```

### 6. Busca com paginação
```bash
GET /patients/search?page=2&limit=20
```

### 7. Busca completa
```bash
GET /patients/search?name=João&cpf=12345678900&minAge=18&maxAge=65&gender=male&page=1&limit=10
```

## Resposta da API

```json
{
  "patients": [
    {
      "id": "uuid-do-paciente",
      "name": "João Silva",
      "cpf": "12345678900",
      "birthDate": "1990-01-01",
      "gender": "male",
      "email": "joao@email.com",
      "phone": "11999999999",
      "weight": "70.50",
      "height": "175.0",
      "bloodType": "O+",
      "medicalHistory": "Hipertensão",
      "allergies": "Penicilina",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "uuid-do-medico",
        "name": "Dr. João Médico",
        "crm": "123456",
        "especialidade": "Endocrinologia"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

## Características da Busca

- **Nome**: Busca parcial e case-insensitive (não diferencia maiúsculas/minúsculas)
- **CPF**: Busca exata, aceita CPF com ou sem formatação
- **Idade**: Calculada automaticamente a partir da data de nascimento
- **Gênero**: Busca exata pelos valores do enum
- **Paginação**: Suporte completo com controle de página e limite
- **Ordenação**: Resultados ordenados por nome (A-Z)

## Filtros Opcionais

Todos os filtros são opcionais e podem ser combinados. Se nenhum filtro for fornecido, retorna todos os pacientes com paginação.

## Limitações

- Máximo de 100 registros por página
- Idade máxima: 150 anos
- Idade mínima: 0 anos
- Página mínima: 1
