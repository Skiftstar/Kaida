from . import diagnosis_bp
from db import get_db_connection
from flask import request, jsonify
from sentence_transformer import model

@diagnosis_bp.route("/recent-diagnoses", methods=["GET"])
def get_past_diagnoses():
    """Fetch past X diagnoses from the database"""
    data = request.args
    count = data.get("count", 5, type=int)
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT id, summary FROM diagnoses ORDER BY created_at DESC LIMIT %s", (count,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        diagnoses = [{"id": row[0], "summary": row[1]} for row in rows]
        return jsonify(diagnoses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@diagnosis_bp.route("/insert", methods=["POST"])
def insert_diagnosis():
    """Insert a new diagnosis into the database and return its ID"""
    data = request.json
    summary = data.get("summary")
    title = data.get("title")

    if not summary:
        return jsonify({"error": "Missing 'summary' field"}), 400
    if not title:
        return jsonify({"error": "Missing 'title' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        embedding = model.encode(summary).tolist()
        cur.execute(
            "INSERT INTO diagnoses (title, summary, embedding) VALUES (%s, %s, %s) RETURNING id",
            (title, summary, embedding)
        )
        diagnosis_id = cur.fetchone()[0]  # Fetch the generated ID
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully", "id": diagnosis_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@diagnosis_bp.route("/update", methods=["PUT"])
def update_diagnosis():
    """Update an existing diagnosis in the database"""
    data = request.json
    diagnosis_id = data.get("id")
    summary = data.get("summary")

    if not diagnosis_id or not summary:
        return jsonify({"error": "Missing 'id' or 'summary' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        embedding = model.encode(summary).tolist()
        cur.execute("UPDATE diagnoses SET summary = %s, embedding = %s WHERE id = %s", (summary, embedding, diagnosis_id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
