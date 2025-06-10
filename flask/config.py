from cachelib.file import FileSystemCache
import os

class Config:
    SESSION_TYPE = 'cachelib'
    SESSION_SERIALIZATION_FORMAT = 'json'
    SESSION_USE_SIGNER = True
    SESSION_PERMANENT = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    SESSION_CACHELIB = FileSystemCache(threshold=500, cache_dir="./sessions")
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/my_vectors")
    SECRET_KEY = os.getenv("SECRET_KEY", "very_randomly_generated_secret_key")