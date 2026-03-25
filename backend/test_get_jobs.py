import asyncio
from database import AsyncSessionLocal
from jobs.service import get_jobs

async def main():
    async with AsyncSessionLocal() as db:
        try:
            await get_jobs(db)
            print("OK")
        except Exception as e:
            print("ERROR", repr(e))

asyncio.run(main())
