import os
print("🛠️ Starting database setup...")

try:
    # Test imports first
    from database import create_tables, SessionLocal, Furniture, SavedDesign
    print("✅ Successfully imported all database modules")
    
    # Create tables
    create_tables()
    
    # Add sample furniture
    db = SessionLocal()
    
    # Check if furniture already exists
    existing_count = db.query(Furniture).count()
    if existing_count > 0:
        print(f"✅ Database already has {existing_count} furniture items")
    else:
        print("📦 Adding sample furniture...")
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
    
    # Verify
    final_count = db.query(Furniture).count()
    print(f"📊 Total furniture items in database: {final_count}")
    
    db.close()
    print("🎉 Database setup completed!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("This means a function is missing from database.py")
except Exception as e:
    print(f"❌ Error during setup: {e}")
    import traceback
    traceback.print_exc()