from flask import Flask, request, jsonify
from routes import embeddings_bp, diagnosis_bp, diagonosis_emb_bp
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import User
from werkzeug.security import check_password_hash

app = Flask(__name__)
app.secret_key = "sdjngksdgnkdsndksndksgnkgkdsngkdsngkdsngkdsngkdsngkdsngkdsngkdsngkdsngkdsngk"

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.get_by_username(username)
        if user and check_password_hash(user.password, password):
            login_user(user)
            return dict(id=user.id, username=username), 200
        return 'Invalid credentials', 401
    
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return 'Logged out', 200

@app.route('/@me', methods=['GET'])
@login_required
def current_user_route():
    return dict(id=current_user.id, username=current_user.username), 200


diagnosis_bp.register_blueprint(diagonosis_emb_bp, url_prefix="/<id>/embeddings")
app.register_blueprint(embeddings_bp, url_prefix="/embeddings")
app.register_blueprint(diagnosis_bp, url_prefix="/diagnosis")


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5050)