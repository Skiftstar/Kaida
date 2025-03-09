from flask import Blueprint

embeddings_bp = Blueprint("embeddings", __name__)

# Import all routes
from .embeddings import *