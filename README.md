## EndoData Backend 

Prontuário Eletrônico na Clínica Santa Luzia para Otimização do Atendimento e Gestão de Informações, construída com NestJS 10, TypeORM (PostgreSQL) e JWT para autenticação. Inclui documentação Swagger, validação e sanitização de entradas, interceptadores de auditoria, rate limiting e módulos de domínio (usuários, pacientes, prescrições, recibos, cálculos metabólicos e dashboard).

### Stack
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **ORM**: TypeORM 0.3 (PostgreSQL)
- **Auth**: JWT (Passport)
- **Validação**: class-validator / class-transformer
- **Docs**: Swagger (`/api/docs`)
- **Container**: Docker / Docker Compose

### Endpoints principais
- Base URL: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`

Consulte também as documentações específicas:
- `JWT_SETUP.md` (autenticação e uso de tokens)
- `src/receipts/RECEIPTS_API.md` (recibos)
- `src/prescriptions/PRESCRIPTIONS_API.md` (prescrições)
- `src/patients/SEARCH_EXAMPLES.md` (exemplos de busca de pacientes)

---

## Como executar

### 1) Com Docker Compose (recomendado)
Pré-requisitos: Docker e Docker Compose instalados.

```bash
docker compose up -d --build
# A API ficará disponível em http://localhost:4000/api
# Swagger em http://localhost:4000/api/docs
```

O `docker-compose.yml` provisiona:
- `postgres` (PostgreSQL 15)
- `backend` (NestJS em modo desenvolvimento com hot reload)
- `pgadmin` (opcional) em `http://localhost:8080` (email: `admin@admin.com`, senha: `admin123`)

Variáveis já definidas no serviço `backend`:
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://myapp_user:myapp_password@postgres:5432/myapp_db`
- `PORT=4000`

Obs.: A imagem expõe a porta 4000 via compose. O Dockerfile lista `EXPOSE 3000`, mas a aplicação usa `PORT=4000`; mantenha o compose como fonte da verdade.

### 2) Execução local (sem Docker)
Pré-requisitos: Node 18+, PostgreSQL local, e um banco acessível por `DATABASE_URL`.

1. Instale dependências:
```bash
npm ci
```
2. Crie um arquivo `.env` na raiz com as variáveis abaixo (exemplo adiante).
3. Execute em desenvolvimento (hot reload):
```bash
npm run start:dev
```
4. Produção (build + start):
```bash
npm run build
npm run start:prod
```

---

## Variáveis de ambiente
Configuração via `.env` (carregado por `@nestjs/config`).

```env
# Porta HTTP (default 4000)
PORT=4000

# URL de conexão do PostgreSQL (TypeORM)
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DBNAME

# CORS: URL do frontend permitido
FRONTEND_URL=http://localhost:3001

# JWT
JWT_SECRET=uma-chave-secreta-forte
JWT_EXPIRES_IN=24h

# Ambiente
NODE_ENV=development
```

Notas:
- Em `NODE_ENV=development`, o TypeORM executa `synchronize: true` (cria/atualiza schema automaticamente). Em produção, desative e use migrações.
- Em produção, SSL é ativado para Postgres com `rejectUnauthorized: false` (ajuste conforme sua infra).

---

## Documentação da API (Swagger)
- Acessar: `http://localhost:4000/api/docs`
- Autorização: clique em "Authorize" e forneça `Bearer <seu_token>` (JWT).

Tags principais:
- `users`: operações de usuários (criação, perfil, atualização de senha/perfil)
- `patients`: cadastro e busca de pacientes
- `prescriptions`: prescrições e itens/medicações
- `receipts`: recibos e itens de recibo
- `dashboard`: métricas e estatísticas
- `calculations`: cálculos IMC e BMR (básicos)
- `metabolic`: histórico de cálculos metabólicos persistidos

---

## Arquitetura e segurança

### Configuração global (`src/main.ts`)
- CORS habilitado com `FRONTEND_URL`.
- Filtro global de exceções `HttpExceptionFilter`.
- Interceptor de auditoria `AuditLogInterceptor`.
- Guard de rate limiting `RateLimitGuard` (100 req/min por usuário – ajuste conforme necessário).
- `ValidationPipe` com transformação, whitelist e bloqueio de campos não permitidos, com resposta padronizada de erros.
- Sanitização básica anti-XSS para campos string no body.
- Prefixo global: `api`.
- Swagger configurado em `/api/docs` com BearerAuth.

### Autenticação e autorização
- Guard JWT aplicado globalmente via `APP_GUARD` no `AppModule`.
- Estratégia em `src/auth/jwt.strategy.ts` buscando a chave em `JWT_SECRET`.
- Decorators auxiliares:
  - `@Public()` para liberar rotas públicas
  - `@CurrentUser()` para acessar o usuário autenticado no controller

### Persistência (TypeORM)
- Postgres conforme `DATABASE_URL`.
- Entidades principais: `User`, `Patient`, `MetabolicCalculation`, `Prescription`, `PrescriptionMedication`, `Receipt`, `ReceiptItem`.

---

## Módulos do domínio

- `auth`: login, validação do usuário, emissão de JWT.
- `users`: CRUD de usuários, atualização de senha e perfil.
- `patients`: cadastro, atualização e busca de pacientes (ver exemplos em `src/patients/SEARCH_EXAMPLES.md`).
- `prescriptions`: gestão de prescrições e medicações (documentado em `src/prescriptions/PRESCRIPTIONS_API.md`).
- `receipts`: emissão e consulta de recibos (documentado em `src/receipts/RECEIPTS_API.md`).
- `metabolic`: serviços de cálculo (IMC, BMR) e persistência do histórico.
- `calculations`: endpoints simples de IMC/BMR sem persistência (úteis para utilitários rápidos).
- `dashboard`: métricas agregadas (pacientes semanais, top medicamentos, receita mensal etc.).

Estruturas notáveis em `src/common/`:
- `filters/http-exception.filter.ts`
- `guards/rate-limit.guard.ts`
- `interceptors/audit-log.interceptor.ts`

---

## Rotas públicas e privadas
Por padrão, todas as rotas são protegidas pelo JWT. Para expor uma rota pública, anote o handler com `@Public()`.

Exemplo de uso de token:
```http
GET /api/users
Authorization: Bearer <seu_token>
```

Fluxo típico:
1) `POST /api/auth/login` → recebe `access_token` e dados básicos do usuário
2) Usar `Authorization: Bearer <token>` nas próximas chamadas

Detalhes e exemplos completos em `JWT_SETUP.md`.

---

## Scripts úteis (npm)
- `start`: inicia a aplicação
- `start:dev`: ambiente de desenvolvimento com watch/hot reload
- `start:prod`: inicia a partir de `dist` após build
- `build`: compila TypeScript
- `lint`: ESLint com fix
- `lint:check`: ESLint sem fix
- `test`: Jest (todos)
- `test:unit`: apenas testes unitários (`*.spec.ts`)
- `test:integration`: apenas testes e2e (`*e2e-spec.ts`)
- `test:all`: unit + integration
- `test:cov`: cobertura de testes

---

## Testes

Executar localmente:
```bash
npm run test        # todos os testes
npm run test:unit   # unitários
npm run test:integration  # e2e
npm run test:cov    # cobertura
```

Há cenários e utilitários em `test/`, incluindo mocks de TypeORM, testes de dashboard e users.

---

## Estrutura do projeto (resumo)

```
src/
  app.module.ts
  main.ts
  auth/
  calculations/
  common/{decorators,filters,guards,interceptors}
  dashboard/
  metabolic/
  patients/
  prescriptions/
  receipts/
  users/
```

Arquivos de referência na raiz:
- `docker-compose.yml` e `Dockerfile`
- `JWT_SETUP.md` (guia JWT)
- `RECEIPTS_DELETE_FIX.md` (observações sobre exclusão de recibos)
- `TESTE_AUTH.md` e diretório `test/` (execução de testes)

---

## Boas práticas e produção
- Defina `JWT_SECRET` forte e seguro.
- Ajuste CORS (`FRONTEND_URL`) conforme origem do frontend.
- Em produção, desative `synchronize` e use migrações.
- Use HTTPS e segredos por gerenciadores (ex.: Docker secrets, Vault).
- Monitore auditoria e taxas (interceptor/guard) e ajuste limites.

---




