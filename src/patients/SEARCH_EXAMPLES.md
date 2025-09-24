# Sistema de Busca de Pacientes

Este documento apresenta exemplos de uso do sistema de busca de pacientes implementado no EndoData.

## Endpoints de Busca

### Endpoint Principal (Recomendado)
**GET** `/patients`

### Endpoint Alternativo
**GET** `/patients/search`

> **Nota**: Ambos os endpoints oferecem as mesmas funcionalidades. O endpoint `/patients` é o principal e mais intuitivo, enquanto `/patients/search` é mantido para compatibilidade.

## Parâmetros de Busca

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `searchText` | string | Busca por texto livre em nome e email (busca parcial) | `João Silva` |
| `name` | string | Nome do paciente (busca parcial, usado quando searchText não é fornecido) | `João` |
| `cpf` | string | CPF do paciente (busca exata) | `12345678900` |
| `minAge` | number | Idade mínima | `18` |
| `maxAge` | number | Idade máxima | `65` |
| `gender` | enum | Gênero do paciente | `male`, `female`, `other` |
| `sortBy` | enum | Campo para ordenação | `name`, `age`, `createdAt` |
| `sortOrder` | enum | Direção da ordenação | `ASC`, `DESC` |
| `page` | number | Página (padrão: 1) | `1` |
| `limit` | number | Limite por página (padrão: 10) | `20` |

## Exemplos de Uso

### 1. Listar todos os pacientes (sem filtros)
```bash
GET /patients
```

### 2. Busca por texto livre (nome e email)
```bash
GET /patients?searchText=João Silva
```

### 3. Buscar por nome específico
```bash
GET /patients?name=João
```

### 4. Buscar por CPF
```bash
GET /patients?cpf=12345678900
```

### 5. Buscar por faixa etária
```bash
GET /patients?minAge=18&maxAge=65
```

### 6. Buscar por gênero
```bash
GET /patients?gender=male
```

### 7. Ordenação por nome (padrão)
```bash
GET /patients?sortBy=name&sortOrder=ASC
```

### 8. Ordenação por idade (mais jovens primeiro)
```bash
GET /patients?sortBy=age&sortOrder=ASC
```

### 9. Ordenação por data de criação (mais recentes primeiro)
```bash
GET /patients?sortBy=createdAt&sortOrder=DESC
```

### 10. Busca combinada com ordenação
```bash
GET /patients?searchText=João&minAge=18&maxAge=65&gender=male&sortBy=age&sortOrder=DESC
```

### 11. Busca com paginação
```bash
GET /patients?page=2&limit=20
```

### 12. Busca completa com todas as opções
```bash
GET /patients?searchText=João&cpf=12345678900&minAge=18&maxAge=65&gender=male&sortBy=createdAt&sortOrder=DESC&page=1&limit=10
```

> **Compatibilidade**: Todos os exemplos acima também funcionam com `/patients/search` no lugar de `/patients`.

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

## Comportamento Inteligente do Endpoint

O endpoint `GET /patients` é **inteligente** e detecta automaticamente como deve se comportar:

### Sem Query Parameters
```bash
GET /patients
```
- **Comportamento**: Lista todos os pacientes ativos
- **Resposta**: Array simples de pacientes
- **Performance**: Otimizada para listagem completa

### Com Query Parameters
```bash
GET /patients?searchText=João&sortBy=name
```
- **Comportamento**: Aplica filtros, ordenação e paginação
- **Resposta**: Objeto com `patients`, `total`, `page`, `limit`
- **Performance**: Otimizada para busca específica

## Características da Busca

- **Busca por Texto Livre**: Busca simultânea em nome e email (case-insensitive)
- **Nome Específico**: Busca parcial apenas no campo nome (usado quando searchText não é fornecido)
- **CPF**: Busca exata, aceita CPF com ou sem formatação
- **Idade**: Calculada automaticamente a partir da data de nascimento
- **Gênero**: Busca exata pelos valores do enum
- **Paginação**: Suporte completo com controle de página e limite
- **Ordenação Dinâmica**: Por nome (padrão), idade ou data de criação (ASC/DESC)

## Filtros Opcionais

Todos os filtros são opcionais e podem ser combinados. Se nenhum filtro for fornecido, retorna todos os pacientes com paginação.

## Limitações

- Máximo de 100 registros por página
- Idade máxima: 150 anos
- Idade mínima: 0 anos
- Página mínima: 1
- searchText tem prioridade sobre name (quando ambos são fornecidos, apenas searchText é usado)

## Notas Importantes

- **Prioridade de Filtros**: O parâmetro `searchText` tem prioridade sobre `name`. Quando ambos são fornecidos, apenas `searchText` é aplicado.
- **Ordenação por Idade**: A ordenação por idade é baseada na data de nascimento (birthDate). Para ordem crescente (ASC), os pacientes mais jovens aparecem primeiro.
- **Busca por Texto Livre**: Busca simultaneamente em nome e email, facilitando a localização de pacientes.
