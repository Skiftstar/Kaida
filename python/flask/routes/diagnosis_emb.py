from . import diagonosis_emb_bp
from flask import request, jsonify
from db import get_db_connection
from sentence_transformer import model

@diagonosis_emb_bp.route("/all", methods=["GET"])
def get_all_embeddings(id):
    """Fetch all embeddings for a given diagnosis ID"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT embedding FROM embeddings WHERE diagnosis_id = %s", (id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        embeddings = [row[0] for row in rows]
        return jsonify(embeddings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@diagonosis_emb_bp.route("/insert", methods=["POST"])
def insert_embedding(id):
    """Insert a new embedding for a given diagnosis ID"""
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "Missing 'embedding' field"}), 400

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

        cur.execute("INSERT INTO embeddings (text, embedding, diagnosis_id) VALUES (%s, %s, %s)", (text, embedding, id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500