from . import diagonosis_emb_bp
from flask import request, jsonify
from db import get_db_connection, execute_and_fetchone_query, execute_query
from sentence_transformer import model
from flask_login import login_required, current_user

@login_required
@diagonosis_emb_bp.route("/all", methods=["GET"])
def get_all_embeddings(id):
    """Fetch all embeddings for a given diagnosis ID"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT id, text FROM diagnosis_embeddings WHERE diagnosis_id = %s", (id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        embeddings = [{
            "id": row[0],
            "text": row[1],
        } for row in rows]
        return jsonify({"embeddings": embeddings}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@login_required
@diagonosis_emb_bp.route("/insert", methods=["POST"])
def insert_embedding(id):
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400

    embedding = model.encode(text).tolist()
    embedding_id = execute_and_fetchone_query("INSERT INTO diagnosis_embeddings (text, embedding, diagnosis_id) VALUES (%s, %s, %s) RETURNING id", (text, embedding, id))


    if not embedding_id:
        return jsonify("error creating embedding"), 500

    return jsonify({"id": embedding_id}), 201
    
@login_required
@diagonosis_emb_bp.route("/insert-many", methods=["POST"])
def insert_many_embeddings(id):
    """Insert multiple embeddings for a given diagnosis ID"""
    data = request.json
    texts = data.get("texts")  # List of text entries

    if not id:
        return jsonify({"error": "Missing 'id' field"}), 400

    if not texts or not isinstance(texts, list):
        return jsonify({"error": "Missing or invalid 'texts' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch existing texts to prevent duplicates
        cur.execute("SELECT text FROM diagnosis_embeddings WHERE text = ANY(%s) AND diagnosis_id = %s;", (texts, id))
        existing_texts = {row[0] for row in cur.fetchall()}
        new_texts = [text for text in texts if text not in existing_texts]

        if not new_texts:
            cur.close()
            conn.close()
            return jsonify({"message": "No new texts to insert"}), 409

        # Compute embeddings for new texts
        embeddings = [model.encode(text).tolist() for text in new_texts]

        # Manually execute multiple INSERT statements
        insert_query = "INSERT INTO diagnosis_embeddings (text, embedding, diagnosis_id) VALUES (%s, %s, %s)"
        for text, embedding in zip(new_texts, embeddings):
            cur.execute(insert_query, (text, embedding, id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully", "inserted_count": len(new_texts)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
@diagonosis_emb_bp.route("/<embedding_id>", methods=["DELETE"])
def delete_user_embedding(id, embedding_id):
    is_deleted = execute_query("DELETE FROM diagnosis_embeddings WHERE id = %s", (embedding_id,)) 

    if not is_deleted:
        return jsonify({"error deleting embedding"}), 500

    return jsonify({}), 204

@login_required
@diagonosis_emb_bp.route("/<embedding_id>", methods=["PUT"])
def update_embedding(id, embedding_id):
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "Missing 'text' field"}), 400

    embedding = model.encode(text).tolist()
    updated = execute_query("UPDATE diagnosis_embeddings SET text = %s, embedding = %s WHERE id = %s", (text, embedding, embedding_id))

    if not updated:
        return jsonify("Failed updating session!"), 500

    return jsonify({}), 200
