# Configuração JWT - EndoData Backend

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

## Como Usar a Autenticação

### 1. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "isAdministrador": false,
    "crm": "123456",
    "especialidade": "Endocrinologia"
  }
}
```

### 2. Usar Token em Requisições
```bash
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Rotas Públicas
Use o decorator `@Public()` para marcar rotas que não precisam de autenticação:

```typescript
@Public()
@Post('register')
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### 4. Acessar Dados do Usuário Autenticado
```typescript
@Get('profile')
getProfile(@CurrentUser() user: CurrentUserData) {
  return user;
}
```

## Estrutura de Arquivos Criados

```
src/auth/
├── auth.module.ts          # Módulo de autenticação
├── auth.service.ts         # Serviço de autenticação
├── auth.controller.ts      # Controller de autenticação
├── jwt.strategy.ts         # Estratégia JWT
├── jwt-auth.guard.ts       # Guard de autenticação
├── decorators/
│   ├── public.decorator.ts # Decorator para rotas públicas
│   └── current-user.decorator.ts # Decorator para usuário atual
└── dto/
    └── login.dto.ts        # DTO para login
```

## Configuração Global

O `JwtAuthGuard` foi configurado globalmente no `app.module.ts`, então todas as rotas são protegidas por padrão, exceto as marcadas com `@Public()`.

## Segurança

- Use uma chave JWT secreta forte em produção
- Configure tempo de expiração adequado
- Valide sempre as credenciais no backend
- Use HTTPS em produção
