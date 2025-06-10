from . import diagnosis_bp
from db import get_db_connection, execute_query, execute_and_fetchall_query
from flask import request, jsonify
from sentence_transformer import model
from flask_login import login_required, current_user

@login_required
@diagnosis_bp.route("recent-diagnoses", methods=["GET"])
def get_past_diagnoses():
    """Fetch past X diagnoses from the database OR fetches ALL diagnoses if count is -1"""
    data = request.args
    count = data.get("count", 5, type=int)
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = "SELECT id, title, summary, created_at, updated_at FROM diagnoses WHERE user_id = %s ORDER BY created_at DESC"
        params = None
        if count > 0:
            query = f"{query} LIMIT %s"
            params = (current_user.id, count)
        else:
            params = (current_user.id,)
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        diagnoses = [{"id": row[0],"title": row[1], "summary": row[2], "created_at": row[3], "updated_at": row[4]} for row in rows]
        return jsonify(diagnoses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
@diagnosis_bp.route("insert", methods=["POST"])
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
            "INSERT INTO diagnoses (title, summary, summary_embedding, user_id) VALUES (%s, %s, %s, %s) RETURNING id",
            (title, summary, embedding, f"{current_user.id}")
        )
        diagnosis_id = cur.fetchone()[0]  # Fetch the generated ID
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Inserted successfully", "id": diagnosis_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@login_required
@diagnosis_bp.route("<id>", methods=["PUT"])
def update_diagnosis(id):
    data = request.json
    summary = data.get("summary")
    title = data.get("title")
    # True when it was edited manually by the user
    title_custom = data.get("title_custom")
    summary_custom = data.get("summary_custom")

    if summary is None or title is None or title_custom is None or summary_custom is None:
        return jsonify({"error": "Missing 'title', 'summary', 'title_custom' or 'summary_custom' field"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        embedding = model.encode(summary).tolist()
        cur.execute("UPDATE diagnoses SET summary = %s, summary_embedding = %s, title = %s, title_custom = %s, summary_custom = %s, updated_at = NOW() WHERE id = %s", (summary, embedding, title, title_custom, summary_custom, id))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
@diagnosis_bp.route("<id>", methods=["DELETE"])
def delete_diagnosis(id):
    is_deleted = execute_query("DELETE FROM diagnoses WHERE id = %s", (id,))

    if not is_deleted:
        return jsonify({"error deleting diagnosis"}), 500

    return jsonify({}), 204

@login_required
@diagnosis_bp.route("get-multi-embedding", methods=["GET"])
def get_multiple_diagnoses_embedding():
    diagnosis_ids = request.args.getlist("ids")
    
    if not diagnosis_ids:
        return jsonify({}), 200

    response = dict()

    for id in diagnosis_ids:
        results = execute_and_fetchall_query("SELECT id, text FROM diagnosis_embeddings WHERE diagnosis_id = %s", (id, ))

        if results is None:
            print(f"Error fetching embeddings for Diagnosis with ID {id}")
            response[id] = []
            return


        response[id] = [row[1] for row in results]

    return jsonify(response), 200
