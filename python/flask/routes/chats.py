from . import chats_bp
from flask_login import login_required, current_user
from db import execute_and_fetchone_query, execute_and_fetchall_query, execute_query
from flask import jsonify, request


@login_required
@chats_bp.route("get-user-chats", methods=["GET"])
def getAllChatsFromUser():
    rows = execute_and_fetchall_query("""
        SELECT 
            chats.id, 
            chats.diagnosis_id, 
            diagnoses.title, 
            chats.updated_at,
            COALESCE(latest_messages.message, '') AS latest_message
        FROM chats
        JOIN diagnoses ON chats.diagnosis_id = diagnoses.id
        LEFT JOIN (
            SELECT DISTINCT ON (chat_id)
                chat_id, message
            FROM chat_messages
            ORDER BY chat_id, created_at DESC
        ) AS latest_messages ON chats.id = latest_messages.chat_id
        WHERE chats.user_id = %s
        ORDER BY chats.updated_at DESC
    """, (current_user.id,))

    if rows is None:
        return jsonify("error fetching chats"), 500

    chats = [{
        "id": row[0],
        "title": row[2],
        "diagnosis_id": row[1],
        "timestamp": row[3],
        "latest_message": row[4] or ""  # fallback to empty string just in case
    } for row in rows]

    return jsonify({"chats": chats}), 200


@login_required
@chats_bp.route("insert", methods=["POST"])
def createNewChat():
    data = request.json
    diagnosis_id = data.get("diagnosis_id")

    chat_id = execute_and_fetchone_query("INSERT INTO chats (user_id, diagnosis_id) VALUES (%s, %s) RETURNING id", (current_user.id, diagnosis_id))
   
    if not chat_id:
        return jsonify("error creating chat"), 500

    return jsonify({"id": chat_id}), 201

@login_required
@chats_bp.route("<id>/get-messages", methods=["GET"])
def get_all_messages_of_chat(id):
    print("called!")
    rows = execute_and_fetchall_query("SELECT id, message, sender FROM chat_messages WHERE chat_id=%s ORDER BY created_at ASC", (id,))

    if not rows:
       return jsonify("error fetching chat messages"), 500
   
    print(rows)

    messages = [{
       "id": row[0],
       "message": row[1],
       "sender": row[2],
    } for row in rows]

    return jsonify({"messages": messages}), 200

@login_required
@chats_bp.route("<id>/core-info", methods=["GET"])
def get_chat_core_info(id):
   rows = execute_and_fetchall_query("SELECT chats.id, chats.diagnosis_id, diagnoses.title FROM chats JOIN diagnoses ON chats.diagnosis_id = diagnoses.id WHERE chats.id = %s", (id,))
   
   if not rows or not len(rows) > 0:
       return jsonify("error fetching chat core info"), 500

   chat_info = dict(id=rows[0][0], diagnosis_id=rows[0][1], title=rows[0][2])

   return jsonify(chat_info), 200

@login_required
@chats_bp.route("<id>/insert", methods=["POST"])
def insert_message_into_chat(id):
    data = request.json
    message = data.get("message")
    sender = data.get("sender")

    message_id = execute_and_fetchone_query("INSERT INTO chat_messages (message, sender, chat_id) VALUES (%s, %s, %s) RETURNING id", (message, sender, id))

    if not message_id:
        return jsonify("error creating chatmessage"), 500

    return jsonify({"id": message_id}), 201

@login_required
@chats_bp.route("<id>", methods=["DELETE"])
def delete_chat(id):
    is_deleted = execute_query("DELETE FROM chats WHERE id = %s", (id,))

    if not is_deleted:
        return jsonify({"error deleting chat"}), 500

    return jsonify({}), 204
