import psycopg2

try:
    conn = psycopg2.connect("postgresql://postgres:2502@127.0.0.1:5432/ai_resume_matcher")
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;")
    conn.commit()
    print("Column added successfully.")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn:
        conn.close()
