from flask import Flask, request, jsonify
from routes import embeddings_bp  # Import blueprint


app = Flask(__name__)

app.register_blueprint(embeddings_bp, url_prefix="/embeddings")

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5050)