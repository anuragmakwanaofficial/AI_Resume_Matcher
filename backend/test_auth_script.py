import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth():
    print("Testing Registration...")
    email = "testuser@example.com"
    password = "testpassword123"
    
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "is_admin": False}
    )
    print("Register Response:", response.status_code, response.json())
    
    print("\nTesting Login...")
    login_response = client.post(
        "/api/auth/login",
        data={"username": email, "password": password}
    )
    print("Login Response:", login_response.status_code, login_response.json())
    
    print("\nTesting Me endpoint...")
    token = login_response.json().get("access_token")
    if token:
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        print("Me Response:", me_response.status_code, me_response.json())

if __name__ == "__main__":
    test_auth()
