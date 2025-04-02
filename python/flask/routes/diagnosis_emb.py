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
    

@diagonosis_emb_bp.route("/insert-many", methods=["POST"])
def insert_many_embeddings():
    """Insert multiple embeddings for a given diagnosis ID"""
    data = request.json
    diagnosis_id = data.get("id")
    texts = data.get("texts")  # List of text entries

    if not diagnosis_id:
        return jsonify({"error": "Missing 'id' field"}), 400

    if not texts or not isinstance(texts, list):
        return jsonify({"error": "Missing or invalid 'texts' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch existing texts to prevent duplicates
        cur.execute("SELECT text FROM embeddings WHERE text = ANY(%s);", (texts,))
        existing_texts = {row[0] for row in cur.fetchall()}
        new_texts = [text for text in texts if text not in existing_texts]

        if not new_texts:
            cur.close()
            conn.close()
            return jsonify({"message": "No new texts to insert"}), 409

        # Compute embeddings for new texts
        embeddings = [model.encode(text).tolist() for text in new_texts]

        # Manually execute multiple INSERT statements
        insert_query = "INSERT INTO embeddings (text, embedding, diagnosis_id) VALUES (%s, %s, %s)"
        for text, embedding in zip(new_texts, embeddings):
            cur.execute(insert_query, (text, embedding, diagnosis_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully", "inserted_count": len(new_texts)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
