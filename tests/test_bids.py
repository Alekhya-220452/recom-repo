import pytest

@pytest.mark.asyncio
async def test_freelancer_can_bid(client):
    # 1. Setup Client and Job
    await client.post("/auth/register", json={
        "name": "Client", "email": "c@test.com", "password": "pass", "role": "client"
    })
    login_c = await client.post("/auth/login", data={
        "username": "c@test.com", "password": "pass"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token_c = login_c.json()["access_token"]
    
    job_res = await client.post("/jobs", json={
        "title": "Need Dev", "description": "Test job", "budget": 100, "deadline": "2026-10-10"
    }, headers={"Authorization": f"Bearer {token_c}"})
    job_id = job_res.json()["job_id"]
    
    # 2. Setup Freelancer and Bid
    await client.post("/auth/register", json={
        "name": "Free Lancer", "email": "f@test.com", "password": "pass", "role": "freelancer"
    })
    login_f = await client.post("/auth/login", data={
        "username": "f@test.com", "password": "pass"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token_f = login_f.json()["access_token"]
    
    bid_res = await client.post("/bids", json={
        "job_id": job_id, "proposal_text": "I can do it", "bid_amount": 90.00
    }, headers={"Authorization": f"Bearer {token_f}"})
    
    assert bid_res.status_code == 201
    assert bid_res.json()["bid_amount"] == 90.00
    assert bid_res.json()["status"] == "pending"
