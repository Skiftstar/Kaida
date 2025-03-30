from flask import request, jsonify
from datetime import datetime, timezone
from sentence_transformer import model
from db import get_db_connection
from . import embeddings_bp 

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

        cur.execute("INSERT INTO embeddings (text, embedding) VALUES (%s, %s)", (text, embedding))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@embeddings_bp.route("insert-many", methods=["POST"])
def insert_many_embeddings():
    """Insert multiple text embeddings into the database."""
    data = request.json
    texts = data.get("texts")

    if not texts:
        return jsonify({"error": "Missing 'texts' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        to_insert = []

        for text in texts:
            # Check if similiar text exists
            query_vector = model.encode(text).tolist()
            cur.execute("""
            SELECT text, embedding <=> %s::vector AS distance
            FROM embeddings
            ORDER BY distance
            LIMIT %s;
            """, (query_vector, 1))

            results = [{"text": row[0], "distance": row[1]} for row in cur.fetchall()]

            print(f"Results for text '{text}': {results}")

            if len(results) > 0 and results[0]["distance"] < 0.1:
                print(f"Similiar text to '{text}' already exists in the database: {results[0]['text']}")
                continue
            else:
                to_insert.append(text)

        for text in to_insert:
            embedding = model.encode(text).tolist()
            cur.execute("INSERT INTO embeddings (text, embedding) VALUES (%s, %s)", (text, embedding))
            conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": f"Texts successfully inserted: {', '.join(to_insert)}"}), 201

    except Exception as e:
        print(f"Error: {e}")
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


@embeddings_bp.route("/search-many", method["GET"])
def search_similar_many():
    query_terms = requests.args.getlist("terms")
    
    if not query_terms:
        return jsonify({"error": "Missing 'terms' query parameter"}), 400

    try:
        query_vectors = model.encode(query_terms).tolist()  # Encode multiple queries
        conn = get_db_connection()
        cur = conn.cursor()

        results = []
        for query_vector, x in enumerate(query_vectors):
            cur.execute("""
                SELECT text, embedding <=> %s::vector AS distance
                FROM embeddings
                ORDER BY distance
                LIMIT %s;
            """, (query_vector, 1))

            row = cur.fetchone()
            if row:
                text, distance = row
                results.append({"query_term": query_terms[x], "result": text})
            else:
                results.append({"query_term": query_terms[x], "result": ""})

        cur.close()
        conn.close()

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
