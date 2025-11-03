from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal, Room, Furniture, SavedDesign
from typing import List
import uvicorn
import json
from datetime import datetime

# Create FastAPI app
app = FastAPI(title="Room Design API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class RoomCreate(BaseModel):
    name: str
    width: float
    depth: float

class FurnitureItem(BaseModel):
    furniture_id: int
    position_x: float
    position_y: float
    rotation: int = 0

class FitnessCheckRequest(BaseModel):
    room_id: int
    furniture_id: int
    position_x: float
    position_y: float

class MultipleFitnessCheckRequest(BaseModel):
    room_id: int
    furniture_items: List[FurnitureItem]

class SavedDesignCreate(BaseModel):
    name: str
    room_id: int
    furniture_items: List[FurnitureItem]

# ========== API ENDPOINTS ==========

@app.get("/")
async def root():
    return {"message": "🎉 Room Design API is running!", "status": "success"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running correctly"}

@app.get("/rooms")
async def get_rooms():
    try:
        db = SessionLocal()
        rooms = db.query(Room).all()
        db.close()
        return rooms
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rooms: {str(e)}")

@app.post("/rooms")
async def create_room(room: RoomCreate):
    try:
        db = SessionLocal()
        db_room = Room(name=room.name, width=room.width, depth=room.depth)
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        db.close()
        return db_room
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating room: {str(e)}")

@app.get("/furniture")
async def get_furniture():
    try:
        db = SessionLocal()
        furniture = db.query(Furniture).all()
        db.close()
        return furniture
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching furniture: {str(e)}")

@app.post("/check-fitness")
async def check_fitness(request: FitnessCheckRequest):
    try:
        db = SessionLocal()
        
        # Get room and furniture from database
        room = db.query(Room).filter(Room.id == request.room_id).first()
        furniture = db.query(Furniture).filter(Furniture.id == request.furniture_id).first()
        
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if not furniture:
            raise HTTPException(status_code=404, detail="Furniture not found")
        
        # Simple fitness check
        fits = (request.position_x + furniture.width <= room.width and 
                request.position_y + furniture.depth <= room.depth)
        
        # Check walking space
        walking_space_x = room.width - (request.position_x + furniture.width)
        walking_space_y = room.depth - (request.position_y + furniture.depth)
        adequate_space = walking_space_x >= 2.0 or walking_space_y >= 2.0
        
        db.close()
        
        return {
            "fits": fits,
            "adequate_space": adequate_space,
            "walking_space_x": walking_space_x,
            "walking_space_y": walking_space_y,
            "message": "Fits perfectly! ✅" if fits else "Doesn't fit! ❌"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking fitness: {str(e)}")

@app.post("/save-design")
async def save_design(design: SavedDesignCreate):
    try:
        db = SessionLocal()
        
        # Check if room exists
        room = db.query(Room).filter(Room.id == design.room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Convert furniture items to JSON
        furniture_data = json.dumps([
            {
                "furniture_id": item.furniture_id,
                "position_x": item.position_x,
                "position_y": item.position_y,
                "rotation": item.rotation
            }
            for item in design.furniture_items
        ])
        
        # Create saved design
        saved_design = SavedDesign(
            name=design.name,
            room_id=design.room_id,
            furniture_data=furniture_data,
            created_at=datetime.now().isoformat()
        )
        
        db.add(saved_design)
        db.commit()
        db.refresh(saved_design)
        
        result = {
            "id": saved_design.id,
            "name": saved_design.name,
            "room_id": saved_design.room_id,
            "created_at": saved_design.created_at
        }
        
        db.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving design: {str(e)}")

@app.get("/saved-designs")
async def get_saved_designs():
    try:
        db = SessionLocal()
        designs = db.query(SavedDesign).all()
        
        result = []
        for design in designs:
            furniture_items = json.loads(design.furniture_data) if design.furniture_data else []
            result.append({
                "id": design.id,
                "name": design.name,
                "room_id": design.room_id,
                "furniture_items": furniture_items,
                "created_at": design.created_at
            })
        
        db.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching designs: {str(e)}")

@app.delete("/saved-designs/{design_id}")
async def delete_saved_design(design_id: int):
    try:
        db = SessionLocal()
        design = db.query(SavedDesign).filter(SavedDesign.id == design_id).first()
        
        if not design:
            raise HTTPException(status_code=404, detail="Design not found")
        
        db.delete(design)
        db.commit()
        db.close()
        
        return {"message": "Design deleted successfully", "id": design_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting design: {str(e)}")

@app.post("/check-multiple-fitness")
async def check_multiple_fitness(request: MultipleFitnessCheckRequest):
    try:
        db = SessionLocal()
        
        # Get room dimensions
        room = db.query(Room).filter(Room.id == request.room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        results = []
        all_fits = True
        
        for item in request.furniture_items:
            # Get furniture details
            furniture = db.query(Furniture).filter(Furniture.id == item.furniture_id).first()
            if not furniture:
                continue
            
            # Calculate actual dimensions based on rotation
            if item.rotation in [90, 270]:
                actual_width = furniture.depth
                actual_depth = furniture.width
            else:
                actual_width = furniture.width
                actual_depth = furniture.depth
            
            # Check if fits within room
            fits = (item.position_x >= 0 and 
                    item.position_y >= 0 and 
                    item.position_x + actual_width <= room.width and 
                    item.position_y + actual_depth <= room.depth)
            
            # Check collisions with other furniture
            collisions = []
            for other_item in request.furniture_items:
                if other_item.furniture_id != item.furniture_id:
                    other_furniture = db.query(Furniture).filter(Furniture.id == other_item.furniture_id).first()
                    if other_furniture:
                        # Calculate other furniture dimensions
                        if other_item.rotation in [90, 270]:
                            other_width = other_furniture.depth
                            other_depth = other_furniture.width
                        else:
                            other_width = other_furniture.width
                            other_depth = other_furniture.depth
                        
                        # Collision detection
                        if (item.position_x < other_item.position_x + other_width and
                            item.position_x + actual_width > other_item.position_x and
                            item.position_y < other_item.position_y + other_depth and
                            item.position_y + actual_depth > other_item.position_y):
                            collisions.append(other_furniture.name)
            
            walking_space_x = room.width - (item.position_x + actual_width)
            walking_space_y = room.depth - (item.position_y + actual_depth)
            adequate_space = walking_space_x >= 2.0 or walking_space_y >= 2.0
            
            if not fits or collisions:
                all_fits = False
            
            results.append({
                "furniture_id": item.furniture_id,
                "furniture_name": furniture.name,
                "fits": fits,
                "collisions": collisions,
                "adequate_space": adequate_space,
                "walking_space_x": walking_space_x,
                "walking_space_y": walking_space_y,
                "message": "Fits perfectly! ✅" if fits and not collisions else 
                          f"Collides with {', '.join(collisions)} ❌" if collisions else 
                          "Doesn't fit in room! ❌"
            })
        
        db.close()
        
        return {
            "all_fits": all_fits,
            "results": results,
            "overall_message": "All furniture fits perfectly! 🎉" if all_fits else "Some furniture doesn't fit properly ⚠️"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking multiple fitness: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Room Design API Server...")
    print("✅ All endpoints are available:")
    print("   GET  / - API status")
    print("   GET  /health - Health check") 
    print("   GET  /rooms - Get all rooms")
    print("   POST /rooms - Create a room")
    print("   GET  /furniture - Get all furniture")
    print("   POST /check-fitness - Check single furniture")
    print("   POST /check-multiple-fitness - Check multiple furniture")
    print("")
    print("📡 Server running on: http://0.0.0.0:8000")
    print("💻 Local access: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)