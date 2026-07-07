import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    import os
    db_password = os.environ.get("DB_PASSWORD", "postgres") # Default to postgres or change to prompt user
    conn = psycopg2.connect(user="postgres", password=db_password, host="127.0.0.1", port="5432")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE ai_resume_matcher;")
    print("Database created successfully")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
