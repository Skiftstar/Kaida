-- init.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    embedding vector(384)
);

CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    summary TEXT NOT NULL,
    summary_embedding vector(384),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diagnosis_embeddings (
    id SERIAL PRIMARY KEY,
    diagnosis_id INT REFERENCES diagnoses(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    embedding vector(384)
);