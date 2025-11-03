import os
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Create SQLite database with absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'room_design.db')}"

print(f"📁 Database path: {SQLALCHEMY_DATABASE_URL}")

# Create engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    width = Column(Float)  # in feet
    depth = Column(Float)  # in feet

class Furniture(Base):
    __tablename__ = "furniture"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    type = Column(String)  # sofa, bed, table, etc.
    width = Column(Float)
    depth = Column(Float)

class SavedDesign(Base):
    __tablename__ = "saved_designs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    room_id = Column(Integer)
    furniture_data = Column(String)  # JSON string of furniture items
    created_at = Column(String)  # ISO date string

# Function to create tables - THIS IS THE MISSING FUNCTION!
def create_tables():
    print("🛠️ Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created!")

# Function to get database session
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

# This only runs if we execute this file directly
if __name__ == "__main__":
    create_tables()
    print("✅ Database setup complete!")