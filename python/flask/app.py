from flask import Flask, request, session, Response
from routes import prompt_history_bp, embeddings_bp, diagnosis_bp, diagonosis_emb_bp, chats_bp
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import User
from werkzeug.security import check_password_hash
from flask_cors import CORS
from flask_session import Session
from cachelib.file import FileSystemCache

def create_app():
    app = Flask(__name__)
    app.secret_key = "sdjngksdgnkdsndksndksgnkgkdsngkdsngkdsngkdsngkdsngkdsngkdsngkdsngkdsngkdsngk"

    app.config['SESSION_TYPE'] = 'cachelib'
    app.config['SESSION_SERIALIZATION_FORMAT'] = 'json'
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_PERMANENT'] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config['SESSION_CACHELIB'] = FileSystemCache(threshold=500, cache_dir="./sessions")

    cors = CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})
    server_session = Session(app)

    login_manager = LoginManager()
    login_manager.login_view = 'login'
    login_manager.init_app(app)

    def is_logged_in(user_id):
        if not user_id:
            return False
        return True

    def public_endpoint(function):
        function.is_public = True
        return function

    @app.before_request
    def check_valid_login():
        user_id = session.get("user_id")
        login_valid = is_logged_in(user_id)

        if (request.endpoint and
                'static' not in request.endpoint and
                not login_valid and
                not request.method == 'OPTIONS' and
                not (getattr(app.view_functions[request.endpoint], 'is_public', False))):
            return Response("Unauthorized", status=401)

    @login_manager.user_loader
    def load_user(user_id):
        return User.get_by_id(user_id)

    @public_endpoint
    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        username = data.get('username')
        password = data.get('password')
        user = User.get_by_username(username)
        if user and check_password_hash(user.password, password):
            login_user(user, remember=True)
            session["user_id"] = user.id
            return dict(id=current_user.id, 
                    username=current_user.username, 
                    email=current_user.email, 
                    push_notifications_enabled=current_user.push_notifications), 200
        return 'Invalid credentials', 401
        
    @app.route('/logout', methods=['GET'])
    def logout():
        logout_user()
        session.pop("user_id", None)
        return 'Logged out', 200

    @app.route('/@me', methods=['GET'])
    def current_user_route():
        return dict(id=current_user.id, 
                    username=current_user.username, 
                    email=current_user.email, 
                    push_notifications_enabled=current_user.push_notifications), 200


    diagnosis_bp.register_blueprint(diagonosis_emb_bp, url_prefix="/<id>/embeddings")
    chats_bp.register_blueprint(prompt_history_bp, url_prefix="/<chat_id>/prompt-history")
    app.register_blueprint(embeddings_bp, url_prefix="/embeddings")
    app.register_blueprint(diagnosis_bp, url_prefix="/diagnosis")
    app.register_blueprint(chats_bp, url_prefix="/chats")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", debug=True, port=5050)
