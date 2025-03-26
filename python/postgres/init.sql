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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
);

CREATE TABLE diagnosis_embeddings (
    id SERIAL PRIMARY KEY,
    diagnosis_id INT REFERENCES diagnoses(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    embedding vector(384)
);

CREATE OR REPLACE FUNCTION update_diagnosis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE diagnoses
    SET updated_at = NOW()
    WHERE id = NEW.diagnosis_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_on_embedding_insert
AFTER INSERT OR UPDATE ON diagnosis_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_diagnosis_updated_at();

CREATE TRIGGER trigger_update_on_summary_change
BEFORE UPDATE OF summary ON diagnoses
FOR EACH ROW
EXECUTE FUNCTION update_diagnosis_updated_at();
