-- Arquivo de inicialização do PostgreSQL
-- Este arquivo é executado automaticamente na primeira vez que o container sobe

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Exemplo: Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14),
    crm VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo: Inserir dados de teste
INSERT INTO users (name, email, cpf, crm, password_hash) VALUES 
    ('João Silva', 'joao@email.com', '123.456.789-00', '12345', crypt('SenhaSegura123!', gen_salt('bf'))),
    ('Maria Santos', 'maria@email.com', '987.654.321-00', '67890', crypt('SenhaSegura123!', gen_salt('bf')))
ON CONFLICT (email) DO NOTHING;