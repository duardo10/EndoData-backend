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
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo: Inserir dados de teste
INSERT INTO users (name, email, password_hash) VALUES 
    ('João Silva', 'joao@email.com', crypt('123456', gen_salt('bf'))),
    ('Maria Santos', 'maria@email.com', crypt('123456', gen_salt('bf')))
ON CONFLICT (email) DO NOTHING;