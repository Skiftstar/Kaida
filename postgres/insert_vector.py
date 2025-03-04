import psycopg2
from psycopg2.extras import execute_values
from sentence_transformers import SentenceTransformer

# Initialize model
model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim vectors

# PostgreSQL connection
conn = psycopg2.connect(
    dbname="my_vectors",
    user="myuser",
    password="mypassword",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# List of texts to insert
texts = [
    "How do I integrate a vector database with Rasa?",
    "What is the best way to store embeddings in PostgreSQL?",
    "How can I use pgvector for similarity search?",
    "Can I use Faiss with a PostgreSQL database?",
]

# Check which texts are missing
cur.execute("SELECT text FROM embeddings WHERE text = ANY(%s);", (texts,))
existing_texts = {row[0] for row in cur.fetchall()}  # Set for quick lookup

# Prepare new entries
new_entries = [(text, model.encode(text).tolist()) for text in texts if text not in existing_texts]

# Insert only missing texts
if new_entries:
    execute_values(cur, "INSERT INTO embeddings (text, embedding) VALUES %s", new_entries)
    conn.commit()
    print(f"Inserted {len(new_entries)} new entries!")
else:
    print("All texts are already in the database. No insertions needed.")

# Cleanup
cur.close()
conn.close()
