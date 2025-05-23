from flask_login import UserMixin
from db import get_db_connection

class User(UserMixin):
    def __init__(self, id, username, email, push_notifications, password):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.push_notifications = push_notifications

    @staticmethod
    def get_by_username(username):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, push_notifications, password FROM users WHERE username = %s", (username,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return User(*row)
        return None

    @staticmethod
    def get_by_id(user_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, push_notifications, password FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return User(*row)
        return None