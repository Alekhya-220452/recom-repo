import pytest

@pytest.mark.asyncio
async def test_client_can_post_job(client):
    # Register and login as client
    await client.post("/auth/register", json={
        "name": "Job Poster", "email": "poster@test.com", "password": "pass", "role": "client"
    })
    login_res = await client.post("/auth/login", data={
        "username": "poster@test.com", "password": "pass"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login_res.json()["access_token"]
    
    # Post a job
    job_res = await client.post("/jobs", json={
        "title": "Need a React Developer",
        "description": "Build a single page app",
        "budget": 500.00,
        "deadline": "2026-12-31"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert job_res.status_code == 201
    assert job_res.json()["title"] == "Need a React Developer"
    assert job_res.json()["budget"] == 500.00
    assert job_res.json()["client_id"] > 0
    assert job_res.json()["status"] == "open"
