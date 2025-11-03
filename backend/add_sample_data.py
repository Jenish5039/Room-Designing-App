from database import SessionLocal, Furniture

def add_sample_furniture():
    db = SessionLocal()
    
    # Sample furniture items
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
    db.close()
    print("✅ Sample furniture added!")

if __name__ == "__main__":
    add_sample_furniture()