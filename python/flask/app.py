from flask import Flask, request, jsonify
from routes import embeddings_bp, diagnosis_bp, diagonosis_emb_bp


app = Flask(__name__)

app.register_blueprint(embeddings_bp, url_prefix="/embeddings")
app.register_blueprint(diagnosis_bp, url_prefix="/diagnosis")
diagnosis_bp.register_blueprint(diagonosis_emb_bp, url_prefix="/<id>/embeddings")

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5050)