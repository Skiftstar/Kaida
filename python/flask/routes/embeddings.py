from flask import request, jsonify
from datetime import datetime, timezone
from sentence_transformer import model
from db import get_db_connection, execute_and_fetchall_query 
from . import embeddings_bp 
from flask_login import login_required, current_user
import ast

def cosine_sim(v1, v2):
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = sum(a * a for a in v1) ** 0.5
    norm2 = sum(b * b for b in v2) ** 0.5
    return dot / (norm1 * norm2) if norm1 and norm2 else 0

@login_required
@embeddings_bp.route("insert", methods=["POST"])
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
        cur.execute("SELECT 1 FROM embeddings WHERE text = %s AND user_id = %s;", (text, current_user.id))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"message": "Text already exists"}), 409

        # Compute embedding
        embedding = model.encode(text).tolist()

        cur.execute("INSERT INTO embeddings (text, embedding, user_id) VALUES (%s, %s, %s)", (text, embedding, current_user.id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@embeddings_bp.route("insert-many", methods=["POST"])
@login_required
def insert_many_embeddings_redo():
    data = request.json
    texts = data.get("texts")

    if not texts:
        return jsonify({"error": "Missing 'texts' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Encode all texts once
        encoded_texts = [(text, model.encode(text).tolist()) for text in texts]

        # Fetch all existing embeddings for current user once
        cur.execute("SELECT text, embedding FROM embeddings WHERE user_id = %s", (current_user.id,))
        raw = cur.fetchall()
        print(raw)
        existing = [(text, ast.literal_eval(embedding)) for text, embedding in raw]

        print(existing)

        # Filter out texts that are too similar to existing ones
        threshold = 0.9
        to_insert = []
        for text, emb in encoded_texts:
            for e in existing:
                print(cosine_sim(emb, e[1]))
            if any(cosine_sim(emb, e[1]) > threshold for e in existing):
                print(f"Skipped similar text: {text}")
                continue
            to_insert.append((text, emb))

        # Batch insert all new embeddings at once
        if to_insert:
            args_str = ",".join(cur.mogrify("(%s, %s, %s)", (t[0], t[1], current_user.id)).decode('utf-8') for t in to_insert)
            cur.execute("INSERT INTO embeddings (text, embedding, user_id) VALUES " + args_str)
            conn.commit()

        cur.close()
        conn.close()

        return jsonify({"message": f"Texts successfully inserted: {', '.join(t[0] for t in to_insert)}"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    

@login_required
@embeddings_bp.route("search", methods=["GET"])
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
            WHERE user_id = %s
            ORDER BY distance
            LIMIT %s;
        """, (query_vector, current_user.id, top_n))

        results = [{"text": row[0], "distance": row[1]} for row in cur.fetchall()]
        cur.close()
        conn.close()

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
@embeddings_bp.route("search-many", methods=["GET"])
def search_similar_many():
    query_terms = request.args.getlist("terms")
    
    if not query_terms:
        return jsonify({"error": "Missing 'terms' query parameter"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        results = []
        for text in query_terms:
            query_vector = model.encode(text).tolist()
            cur.execute("""
                SELECT text, embedding <=> %s::vector AS distance
                FROM embeddings
                WHERE user_id = %s
                ORDER BY distance
                LIMIT %s;
            """, (query_vector, current_user.id, 1))

            row = cur.fetchone()
            if row:
                result_text, distance = row
                results.append({"query_term": text, "result": result_text})
            else:
                results.append({"query_term": text, "result": ""})

        cur.close()
        conn.close()

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
@embeddings_bp.route("all", methods=["GET"])
def get_all_user_embeddings():
    results = execute_and_fetchall_query("SELECT id, text FROM embeddings WHERE user_id = %s", (current_user.id, ))

    if results is None:
        return jsonify("Error fetching user embeddings"), 500


    embeddings = [{
        "id": row[0],
        "text": row[1],
    } for row in results]

    return jsonify({"embeddings": embeddings}), 200
