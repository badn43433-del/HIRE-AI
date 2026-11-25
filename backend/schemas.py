"""
Pydantic Schemas for HireShield AI Enterprise Backend
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Literal["candidate", "interviewer", "admin"]
    department: Optional[str] = "Engineering"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    status: Literal["active", "suspended", "pending"]
    created_at: datetime
    two_factor_enabled: bool = True

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    email: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ProctorSignal(BaseModel):
    session_id: str
    signal_type: Literal[
        "tab_switch", "multiple_faces", "no_face", 
        "eye_gaze_diverted", "mobile_phone", "copy_paste", "background_voice"
    ]
    severity: Literal["low", "medium", "high"]
    confidence: float = Field(ge=0.0, le=1.0)
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CodeExecutionRequest(BaseModel):
    code: str
    language: Literal["python", "typescript", "javascript", "cpp", "java"]
    stdin: Optional[str] = ""

class CodeExecutionResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: float

class RubricEvaluationSubmit(BaseModel):
    session_id: str
    candidate_id: str
    technical_score: int = Field(ge=1, le=5)
    coding_score: int = Field(ge=1, le=5)
    system_design_score: int = Field(ge=1, le=5)
    communication_score: int = Field(ge=1, le=5)
    problem_solving_score: int = Field(ge=1, le=5)
    interviewer_notes: str
    hiring_verdict: Literal["STRONG_HIRE", "HIRE", "LEANING_HIRE", "LEANING_REJECT", "REJECT"]
