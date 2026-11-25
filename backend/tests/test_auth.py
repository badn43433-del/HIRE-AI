"""
Unit Tests for HireShield AI Authentication & RBAC
Run with: pytest backend/tests/test_auth.py
"""

import pytest
from datetime import timedelta
from backend.routers.auth import create_access_token, SECRET_KEY, ALGORITHM
from jose import jwt

def test_jwt_token_generation():
    payload = {"sub": "sarah.jenkins@enterprise-recruit.com", "role": "candidate", "name": "Sarah Jenkins"}
    token = create_access_token(payload, expires_delta=timedelta(minutes=60))
    assert isinstance(token, str)
    assert len(token) > 20

    # Decode and verify claims
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == "sarah.jenkins@enterprise-recruit.com"
    assert decoded["role"] == "candidate"
    assert "exp" in decoded

def test_rbac_roles_supported():
    allowed_roles = ["candidate", "interviewer", "admin"]
    for role in allowed_roles:
        token = create_access_token({"sub": f"user@{role}.com", "role": role})
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["role"] == role
