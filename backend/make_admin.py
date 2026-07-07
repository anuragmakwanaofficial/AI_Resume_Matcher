import psycopg2

conn = psycopg2.connect('postgresql://postgres:2502@127.0.0.1:5432/ai_resume_matcher')
cursor = conn.cursor()
cursor.execute("UPDATE users SET is_admin = TRUE WHERE email = 'testuser@example.com';")
conn.commit()
conn.close()
print("testuser is now an admin.")
