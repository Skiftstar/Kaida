-- init.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- hashed!
    push_notifications BOOLEAN DEFAULT FALSE
);

INSERT INTO users (username, email, push_notifications, password)
SELECT 'admin', 'admin@test.de', false, 'pbkdf2:sha256:1000000$afLeq4uWZFsjSIm7$8aded7d5d9b4681dbc1605905690d70e2282c53a84b1b804c1b8e170904ef100' -- Just '1234' as password
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);

-- permanent embeddings for a user
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    embedding vector(384)
);

CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    summary_embedding vector(384),
    title_custom BOOLEAN DEFAULT FALSE,
    summary_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diagnosis_embeddings (
    id SERIAL PRIMARY KEY,
    diagnosis_id INT REFERENCES diagnoses(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    embedding vector(384)
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    diagnosis_id INT REFERENCES diagnoses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- stores model responses and system prompts used
CREATE TABLE prompt_history (
    id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
	id SERIAL PRIMARY KEY,
	diagnosis_id INT REFERENCES diagnoses(id) ON DELETE CASCADE,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	time TIMESTAMP NOT NULL,
	title TEXT NOT NULL
);

CREATE TABLE prescriptions (
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	med_name TEXT NOT NULL,
	start_date TIMESTAMP DEFAULT NOW(),
	end_date TIMESTAMP NOT NULL,
	dose INT NOT NULL,
	dose_unit TEXT CHECK (dose_unit IN ('mg', 'ml')),
	interval INT NOT NULL,
  interval_unit TEXT CHECK (interval_unit IN ('minutes', 'hours', 'days'))
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

CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_on_embedding_insert
AFTER INSERT OR UPDATE ON diagnosis_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_diagnosis_updated_at();

CREATE TRIGGER trigger_update_on_chat_message
AFTER INSERT OR UPDATE ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_updated_at();
