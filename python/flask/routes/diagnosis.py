from . import diagnosis_bp
from db import get_db_connection
from flask import request, jsonify
from sentence_transformer import model

@diagnosis_bp.route("/insert", methods=["POST"])
def insert_diagnosis():
    """Insert a new diagnosis into the database"""
    data = request.json
    summary = data.get("summary")

    if not summary:
        return jsonify({"error": "Missing 'summary' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        embedding = model.encode(summary).tolist()
        cur.execute("INSERT INTO diagnoses (summary, embedding) VALUES (%s, %s)", (summary, embedding))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully"}), 201

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