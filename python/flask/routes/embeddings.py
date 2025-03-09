from flask import request, jsonify
from datetime import datetime, timezone
from sentence_transformers import SentenceTransformer
from db import get_db_connection
from . import embeddings_bp  # Import the blueprint

# Load Sentence Transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

@embeddings_bp.route("/insert", methods=["POST"])
def insert_embedding():
    """Insert a new text embedding into the database."""
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if text exists
        cur.execute("SELECT 1 FROM embeddings WHERE text = %s;", (text,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"message": "Text already exists"}), 409

        # Compute embedding
        embedding = model.encode(text).tolist()
        now = datetime.now(timezone.utc)

        cur.execute("INSERT INTO embeddings (text, embedding, created_at) VALUES (%s, %s, %s)", (text, embedding, now))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@embeddings_bp.route("/search", methods=["GET"])
def search_similar():
    """Search for similar embeddings in the database."""
    query_text = request.args.get("text")
    top_n = request.args.get("top_n", default=5, type=int)

    if not query_text:
        return jsonify({"error": "Missing 'text' query parameter"}), 400

    try:
        query_vector = model.encode(query_text).tolist()
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT text, embedding <=> %s::vector AS distance
            FROM embeddings
            ORDER BY distance
            LIMIT %s;
        """, (query_vector, top_n))

        results = [{"text": row[0], "distance": row[1]} for row in cur.fetchall()]
        cur.close()
        conn.close()

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500