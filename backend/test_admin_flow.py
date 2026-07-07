import requests
import sqlite3
import psycopg2

BASE_URL = "http://localhost:8000"

def test_admin_flow():
    # 1. Register a user
    email = "test_admin_user@example.com"
    password = "password123"
    
    print("Registering user...")
    res = requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": password})
    if res.status_code == 400 and "already registered" in res.text:
        print("User already exists.")
    else:
        res.raise_for_status()
        print("User registered.")

    # 2. Make user admin via DB
    print("Promoting user to admin in DB...")
    conn = psycopg2.connect("postgresql://postgres:2502@127.0.0.1:5432/ai_resume_matcher")
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET is_admin = TRUE WHERE email = %s;", (email,))
    conn.commit()
    conn.close()

    # 3. Login
    print("Logging in...")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    res.raise_for_status()
    token = res.json()["access_token"]
    print("Logged in. Token retrieved.")

    # 4. Access admin endpoint
    print("Accessing admin API endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/admin/analyses", headers=headers)
    res.raise_for_status()
    print("Success! Admin API responded with:", res.json())

if __name__ == "__main__":
    test_admin_flow()
