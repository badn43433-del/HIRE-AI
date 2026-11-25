"""
HireShield AI - Enterprise Technical Live Interview Platform
FastAPI Application Entrypoint with Local AI Pipelines & WebRTC Signaling
100% Self-Contained. ZERO Paid External AI APIs.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import os

from backend.routers import auth, candidates, interviews, proctoring, admin

app = FastAPI(
    title="HireShield AI Enterprise Backend",
    description="Local AI-powered live technical interview proctoring and assessment platform (OpenCV, MediaPipe, YOLO, Whisper)",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(auth.router)
app.include_router(candidates.router)
app.include_router(interviews.router)
app.include_router(proctoring.router)
app.include_router(admin.router)

# In-memory WebSocket Connection Manager for Live Rooms
class LiveInterviewRoomManager:
    def __init__(self):
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_rooms:
            self.active_rooms[session_id] = []
        self.active_rooms[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_rooms:
            if websocket in self.active_rooms[session_id]:
                self.active_rooms[session_id].remove(websocket)
            if len(self.active_rooms[session_id]) == 0:
                del self.active_rooms[session_id]

    async def broadcast(self, session_id: str, message: dict, sender: WebSocket):
        if session_id in self.active_rooms:
            for connection in self.active_rooms[session_id]:
                if connection != sender:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        pass

room_manager = LiveInterviewRoomManager()

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "HireShield AI Enterprise Engine",
        "version": "2.0.0",
        "external_ai_apis_required": False,
        "local_models_active": ["MediaPipe FaceMesh", "OpenCV Gaze", "YOLOv8 Phone Detector", "Whisper STT", "Local NLP Scorer"],
        "active_rooms": len(room_manager.active_rooms)
    }

# Live Assessment WebRTC Signaling & Collaborative Sync Relay
@app.websocket("/ws/rooms/{session_id}")
async def websocket_room_endpoint(websocket: WebSocket, session_id: str):
    await room_manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            # Types: "offer", "answer", "ice_candidate", "whiteboard_draw", "code_sync", "chat_message", "proctor_alert"
            await room_manager.broadcast(session_id, payload, sender=websocket)
    except WebSocketDisconnect:
        room_manager.disconnect(session_id, websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=os.getenv("FASTAPI_HOST", "127.0.0.1"),
        port=int(os.getenv("FASTAPI_PORT", "8000")),
        reload=os.getenv("FASTAPI_RELOAD", "false").lower() == "true",
    )
