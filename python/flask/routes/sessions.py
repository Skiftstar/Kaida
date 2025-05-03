from . import sessions_bp
from util import require_fields
from flask import request, jsonify
from db import get_db_connection, execute_and_fetchone_query, execute_and_fetchall_query, execute_query
from flask_login import login_required, current_user

@login_required
@sessions_bp.route("get", methods=["GET"])
def get_user_sessions():
    rows = execute_and_fetchall_query("SELECT id, title, time, reason, diagnosis_id FROM sessions WHERE user_id = %s ORDER BY time DESC", (current_user.id,))

    if rows is None:
        return jsonify("Failed fetching user sessions"), 500

    sessions = [{
        "id": row[0],
        "title": row[1],
        "time": row[2],
        "reason": row[3],
        "diagnosisId": row[4],
    } for row in rows]

    return jsonify({"sessions": sessions}), 200

@login_required
@sessions_bp.route("insert", methods=["POST"])
def insert_session():
    data = request.json
    title, reason, diagnosis_id, time = require_fields(data, "title", "reason", "diagnosisId", "time")

    id = execute_and_fetchone_query("INSERT INTO sessions (title, reason, time, diagnosis_id, user_id) VALUES(%s, %s, %s, %s, %s) RETURNING id", (title, reason, time, diagnosis_id, current_user.id))

    if id is None:
        return jsonify("Failed inserting session!"), 500

    return jsonify({"id": id}), 201

@login_required
@sessions_bp.route("<id>", methods=["PUT"])
def update_session(id):
    data = request.json
    title, reason, diagnosis_id, time = require_fields(data, "title", "reason", "diagnosisId", "time")

    updated = execute_query("UPDATE sessions SET title = %s, reason = %s, time = %s, diagnosis_id = %s WHERE id = %s", (title, reason, time, diagnosis_id, id))

    if not updated:
        return jsonify("Failed updating session!"), 500

    return jsonify({}), 200


@login_required
@sessions_bp.route("<id>", methods=["DELETE"])
def delete_session(id):
    is_deleted = execute_query("DELETE FROM sessions WHERE id = %s", (id,))

    if not is_deleted:
        return jsonify({"error deleting session"}), 500

    return jsonify({}), 204
