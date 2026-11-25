"""
Candidate Router for HireShield AI
Handles Upcoming Interviews, Hardware Diagnostics logging, Resume upload, and Profile
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])

class DiagnosticsLog(BaseModel):
    camera_passed: bool
    mic_passed: bool
    ping_ms: int
    download_mbps: float
    upload_mbps: float

@router.get("/interviews")
async def get_upcoming_interviews(candidate_email: Optional[str] = None):
    return [
        {
            "id": "int-live-101",
            "roleTitle": "Senior Frontend UI Architect",
            "department": "Engineering",
            "interviewerName": "Marcus Vance",
            "interviewerEmail": "marcus.vance@techcorp.io",
            "scheduledDate": "Today",
            "scheduledTime": "14:00 PM EST",
            "durationMinutes": 45,
            "status": "scheduled",
            "meetingLink": "/meet/int-live-101"
        }
    ]

@router.post("/diagnostics")
async def log_diagnostics(diag: DiagnosticsLog):
    return {
        "status": "certified",
        "timestamp": "2026-10-18T14:00:00Z",
        "message": "Candidate workstation certified for proctored evaluation."
    }

@router.post("/resume")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or "resume.pdf"
    return {
        "success": true,
        "filename": filename,
        "content_type": file.content_type,
        "parsed_skills": ["React 19", "TypeScript", "WebSockets", "Vite", "Distributed Systems"]
    }
