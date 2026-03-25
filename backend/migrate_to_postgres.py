import asyncio
import sys
import os

# Add the current directory to sys.path so we can import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
# Import all models to register them with Base.metadata
from auth.models import User
from jobs.models import Job
from bids.models import Bid
from projects.models import Project
from payments.models import Transaction
from reviews.models import Review
from notifications.models import Notification
from support.models import SupportTicket, Dispute
from messages.models import Message

async def migrate():
    print("Nexlance Protocol: Database Migration Initialized...")
    print(f"Targeting: {engine.url}")
    
    try:
        async with engine.begin() as conn:
            print("System Check: Validating SQLAlchemy models...")
            # Uncomment below if you want to wipe the target DB first
            # print("Executing: DROP ALL TABLES")
            # await conn.run_sync(Base.metadata.drop_all)
            
            print("Executing: CREATE ALL TABLES")
            await conn.run_sync(Base.metadata.create_all)
            
        print("\nSUCCESS: Nexlance Database has been migrated to PostgreSQL.")
        print("Note: If using JSONB or specific PG extensions, ensure they are enabled in your instance.")
    except Exception as e:
        print(f"\nCRITICAL FAILURE: {str(e)}")

if __name__ == "__main__":
    asyncio.run(migrate())
