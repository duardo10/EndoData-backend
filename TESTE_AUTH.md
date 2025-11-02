# Teste da Autenticação JWT

## 1. Iniciar a Aplicação

```bash
npm run start:dev
```

A aplicação estará disponível em: http://209.145.59.215:3000

## 2. Documentação da API

Acesse a documentação Swagger em: http://209.145.59.215:3000/api/docs

## 3. Testar o Endpoint de Login

### Criar um usuário primeiro (rota pública)
```bash
curl -X POST http://209.145.59.215:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. João Silva",
    "email": "joao@exemplo.com",
    "password": "senha123",
    "cpf": "12345678901",
    "crm": "123456",
    "especialidade": "Endocrinologia"
  }'
```

### Fazer login
```bash
curl -X POST http://209.145.59.215:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Dr. João Silva",
    "email": "joao@exemplo.com",
    "isAdministrador": false,
    "crm": "123456",
    "especialidade": "Endocrinologia",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 4. Testar Rotas Protegidas

### Listar usuários (rota protegida)
```bash
curl -X GET http://209.145.59.215:3000/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar usuário por ID (rota protegida)
```bash
curl -X GET http://209.145.59.215:3000/api/users/USER_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 5. Testar Rotas Públicas

### Criar usuário (rota pública)
```bash
curl -X POST http://209.145.59.215:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Maria Santos",
    "email": "maria@exemplo.com",
    "password": "senha456",
    "cpf": "98765432100",
    "crm": "654321",
    "especialidade": "Endocrinologia"
  }'
```

## 6. Testar Sem Token (deve retornar 401)

```bash
curl -X GET http://209.145.59.215:3000/api/users
```

**Resposta esperada:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## 7. Variáveis de Ambiente

Certifique-se de ter as seguintes variáveis no seu arquivo `.env`:

```env
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=24h
DATABASE_URL=postgresql://username:password@209.145.59.215:5432/endodata
```

## 8. Estrutura de Arquivos Implementados

```
src/auth/
├── auth.module.ts          ✅ Módulo de autenticação
├── auth.service.ts         ✅ Serviço de autenticação
├── auth.controller.ts      ✅ Controller de autenticação
├── jwt.strategy.ts         ✅ Estratégia JWT
├── jwt-auth.guard.ts       ✅ Guard de autenticação
├── decorators/
│   ├── public.decorator.ts ✅ Decorator para rotas públicas
│   └── current-user.decorator.ts ✅ Decorator para usuário atual
└── dto/
    └── login.dto.ts        ✅ DTO para login
```

## 9. Funcionalidades Implementadas

- ✅ Endpoint POST /auth/login
- ✅ Geração de token JWT
- ✅ Validação de email/senha
- ✅ Middleware de autenticação global
- ✅ Guards para rotas protegidas
- ✅ Decorator @Public() para rotas públicas
- ✅ Decorator @CurrentUser() para acessar dados do usuário
- ✅ Documentação Swagger completa
- ✅ Validação de dados com class-validator
- ✅ Tratamento de erros