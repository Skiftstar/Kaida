from flask import Blueprint

embeddings_bp = Blueprint("embeddings", __name__)
diagnosis_bp = Blueprint("diagnosis", __name__)
diagonosis_emb_bp = Blueprint("diagonosis_emb", __name__)
chats_bp = Blueprint("chats", __name__)
prompt_history_bp = Blueprint("prompt_history", __name__)
meds_bp = Blueprint("meds", __name__)
sessions_bp = Blueprint("sessions", __name__)

# Import all routes
from .embeddings import *
from .diagnosis import *
from .diagnosis_emb import *
from .chats import * 
from .prompt_history import *
from .meds import *
from .sessions import *
