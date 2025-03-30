from flask import Blueprint

embeddings_bp = Blueprint("embeddings", __name__)
diagnosis_bp = Blueprint("diagnosis", __name__)
diagonosis_emb_bp = Blueprint("diagonosis_emb", __name__)

# Import all routes
from .embeddings import *