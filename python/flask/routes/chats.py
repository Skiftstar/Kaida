from . import chats_bp
from flask_login import login_required, current_user
from db import get_db_connection, execute_and_fetch_query
from flask import jsonify, request

@login_required
@chats_bp.route("get-user-chats", methods=["GET"])
def getAllChatsFromUser():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT chats.id, chats.diagnosis_id, diagnoses.title, chats.updated_at FROM chats JOIN diagnoses ON chats.diagnosis_id = diagnoses.id WHERE chats.user_id = %s ORDER BY chats.updated_at DESC", (f"{current_user.id}",))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        chats = [{"id": row[0], "title": row[2], "diagnosis_id": row[1], "timestamp": row[3]} for row in rows]
        print(chats)
        return jsonify({"chats": chats}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
@chats_bp.route("insert", methods=["POST"])
def createNewChat():
    data = request.json
    diagnosis_id = data.get("diagnosis_id")

    chat_id = execute_and_fetch_query("INSERT INTO chats (user_id, diagnosis_id) VALUES (%s, %s) RETURNING id", (current_user.id, diagnosis_id))
   
    if not chat_id:
        return jsonify("error creating chat"), 500

    return jsonify({"id": chat_id}), 201
