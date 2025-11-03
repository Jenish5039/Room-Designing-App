from database import SessionLocal, Furniture, Room

def check_database():
    db = SessionLocal()
    
    print("🔍 Checking database contents...")
    
    # Check rooms
    rooms = db.query(Room).all()
    print(f"📊 Rooms: {len(rooms)} found")
    for room in rooms:
        print(f"   - {room.name} ({room.width}ft x {room.depth}ft)")
    
    # Check furniture
    furniture = db.query(Furniture).all()
    print(f"📊 Furniture: {len(furniture)} found")
    for item in furniture:
        print(f"   - {item.name} ({item.type}): {item.width}ft x {item.depth}ft")
    
    db.close()

if __name__ == "__main__":
    check_database()