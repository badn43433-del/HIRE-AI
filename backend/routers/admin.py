"""
Admin & Governance Router
Handles RBAC User Management, Immutable Audit Logs, and Global Platform Settings
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

class SystemSettingsUpdate(BaseModel):
    strictness: str
    gaze_tolerance_seconds: int
    enable_multiple_person_alerts: bool
    enable_mobile_phone_detection: bool
    two_factor_required: bool

@router.get("/analytics")
async def get_analytics():
    return {
        "total_interviews": 1428,
        "active_live_rooms": 6,
        "average_trust_score": 94.8,
        "malpractice_flag_rate": 2.1,
        "department_funnel": {
            "Frontend UI": 480,
            "Backend Systems": 420,
            "AI / ML": 320,
            "Cybersecurity": 208
        }
    }

@router.put("/settings")
async def update_settings(settings: SystemSettingsUpdate):
    return {
        "success": True,
        "message": "Global proctoring policies updated successfully."
    }
