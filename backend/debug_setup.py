import os
print("🔍 Starting debug setup...")

# Check if database file exists
if os.path.exists("room_design.db"):
    print("📁 Database file exists")
else:
    print("📁 Database file does not exist")

try:
    from database import create_tables, SessionLocal, Furniture
    print("✅ Successfully imported database modules")
    
    # Create tables
    print("🛠️ Creating tables...")
    create_tables()
    
    # Check if furniture exists
    db = SessionLocal()
    existing_furniture = db.query(Furniture).first()
    
    if existing_furniture:
        print("✅ Furniture already exists in database")
        all_furniture = db.query(Furniture).all()
        print(f"📊 Found {len(all_furniture)} furniture items:")
        for item in all_furniture:
            print(f"   - {item.name} ({item.width}ft x {item.depth}ft)")
    else:
        print("📝 No furniture found, adding sample data...")
        sample_furniture = [
            {"name": "Sofa", "type": "sofa", "width": 6.0, "depth": 3.0},
            {"name": "Dining Table", "type": "table", "width": 4.0, "depth": 3.0},
            {"name": "Queen Bed", "type": "bed", "width": 5.0, "depth": 7.0},
            {"name": "Bookshelf", "type": "storage", "width": 3.0, "depth": 1.0},
            {"name": "Armchair", "type": "chair", "width": 2.5, "depth": 2.5},
        ]
        
        for item_data in sample_furniture:
            furniture = Furniture(**item_data)
            db.add(furniture)
        
        db.commit()
        print("✅ Sample furniture added!")
    
    db.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("🔍 Debug setup completed!")