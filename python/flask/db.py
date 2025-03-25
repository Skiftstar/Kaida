import psycopg2
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/my_vectors")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)
