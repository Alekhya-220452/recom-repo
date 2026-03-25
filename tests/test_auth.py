import pytest

@pytest.mark.asyncio
async def test_register_client(client):
    response = await client.post("/auth/register", json={
        "name": "Test Client",
        "email": "client@test.com",
        "password": "password123",
        "role": "client",
        "bio": "I am a client"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "client@test.com"
    assert response.json()["role"] == "client"

@pytest.mark.asyncio
async def test_login_success(client):
    # First register
    await client.post("/auth/register", json={
        "name": "Test User",
        "email": "login@test.com",
        "password": "password123",
        "role": "freelancer"
    })
    
    # Then login (OAuth2 expects form data in request body with explicit Content-Type)
    response = await client.post("/auth/login", data={
        "username": "login@test.com",
        "password": "password123"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
