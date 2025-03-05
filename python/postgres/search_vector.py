import psycopg2
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # Outputs 384-dim vectors

# Postgres connection
conn = psycopg2.connect(
    dbname="my_vectors",
    user="myuser",
    password="mypassword",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# Function to search similar vectors in PostgreSQL
def search_similar(query_text, top_n=5):
    query_vector = model.encode(query_text).tolist()

    cur = conn.cursor()
    cur.execute("""
        SELECT text, embedding <=> %s::vector AS distance
        FROM embeddings
        ORDER BY distance
        LIMIT %s;
    """, (query_vector, top_n))


    results = cur.fetchall()
    cur.close()
    return results

# Example usage
query = "How do I connect Faiss to a database?"
similar_entries = search_similar(query)

print("Query:", query)
print("\n")

print("Most similar entries:")
for entry in similar_entries:
    print(entry[0], "| Distance:", entry[1])
