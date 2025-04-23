import psycopg2
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/my_vectors")


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def execute_and_fetch_query(query: str, params: tuple):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query, params)
        result = cur.fetchone()[0]  # Fetch the generated ID
        conn.commit()
        cur.close()
        conn.close()
        return result
    except Exception as e:
        print(f"Error executing query {query}: {str(e)}")
        return None
