from . import prompt_history_bp
from flask import request, jsonify
from db import get_db_connection, execute_and_fetchone_query, execute_and_fetchall_query
from flask_login import login_required, current_user

@login_required
@prompt_history_bp.route("/insert", methods=["POST"])
def insert_prompt_history(chat_id):
    data = request.json
    sender = data.get("sender")
    prompt = data.get("prompt")

    history_id = execute_and_fetchone_query("INSERT INTO prompt_history (chat_id, sender, prompt) VALUES (%s, %s, %s) RETURNING ID", (chat_id, sender, prompt))
    
    if history_id is None:
        return jsonify("Error adding to prompt_history"), 500

    return jsonify({"id": history_id}), 201

@login_required
@prompt_history_bp.route("/get-history", methods=["GET"])
def get_chat_prompt_history(chat_id):
    rows = execute_and_fetchall_query("SELECT id, sender, prompt, created_at FROM prompt_history WHERE chat_id = %s ORDER BY created_at ASC", (chat_id,))

    if not rows:
        return jsonify("error fetching prompt_history"), 500

    history = [{
        "id": row[0],
        "sender": row[1],
        "prompt": row[2],
        "timestamp": row[3],
    } for row in rows]

    return jsonify({"history": history}), 200
