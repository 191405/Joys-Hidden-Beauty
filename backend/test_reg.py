import httpx

try:
    res = httpx.post("http://localhost:8000/api/v1/auth/register", json={
        "email": "testmaster@example.com",
        "password": "password123",
        "first_name": "TestCrash",
        "phone": ""
    }, timeout=10.0)
    print("STATUS:", res.status_code)
    print("BODY:", res.text)
except Exception as e:
    print("ERROR:", str(e))
