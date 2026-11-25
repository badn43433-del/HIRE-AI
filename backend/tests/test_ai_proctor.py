"""
Unit Tests for Local AI Proctoring & Evaluator Algorithms
Run with: pytest backend/tests/test_ai_proctor.py
"""

import pytest
import numpy as np
from backend.ai.evaluator import local_evaluator
from backend.ai.vision_proctor import VisionProctorPipeline

def test_local_evaluator_high_quality_answer():
    question = "How do you optimize React render cycles when dealing with complex high-frequency WebSocket streams?"
    answer = (
        "We optimize React render cycles by batching WebSocket messages using a debounce and throttle queue, "
        "memoizing component trees with useMemo, useCallback, and React.memo, and isolating local state "
        "in a virtual DOM sandbox to prevent unnecessary re-render cascading and reduce latency."
    )
    result = local_evaluator.evaluate_response(question, answer, suspicious_flags=0)

    assert result["score"] >= 70
    assert result["trust_score"] == 100
    assert "conceptual depth" in result["ai_critique"]

def test_local_evaluator_suspicious_penalties():
    question = "Explain JWT storage strategies."
    answer = "Tokens are stored in cookies."
    # Candidate had 3 tab switches
    result = local_evaluator.evaluate_response(question, answer, suspicious_flags=3)

    # Trust score should have deducted penalty
    assert result["trust_score"] < 100
    assert result["trust_score"] <= 65

def test_vision_pipeline_gaze_divergence():
    pipeline = VisionProctorPipeline(gaze_threshold_degrees=20.0)
    # Centered eye corners and centered iris
    iris = np.array([[0.5, 0.5]])
    corners = np.array([[0.3, 0.5], [0.7, 0.5]])
    gaze = pipeline.compute_gaze_divergence(iris, corners)

    assert gaze["is_diverted"] is False
    assert gaze["direction"] == "CENTER"

def test_vision_pipeline_gaze_looking_away():
    pipeline = VisionProctorPipeline(gaze_threshold_degrees=20.0)
    # Strongly shifted iris to right
    iris = np.array([[0.69, 0.5]])
    corners = np.array([[0.3, 0.5], [0.7, 0.5]])
    gaze = pipeline.compute_gaze_divergence(iris, corners)

    assert gaze["is_diverted"] is True
    assert gaze["direction"] == "RIGHT"
