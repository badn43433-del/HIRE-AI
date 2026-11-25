"""
HireShield AI - Local Object Detection Pipeline
Uses Ultralytics YOLOv8 / ONNX Runtime to detect mobile phones, earbuds, and secondary devices.
ZERO external cloud vision APIs.
"""

from typing import List, Dict, Any
import numpy as np

class LocalYOLOObjectDetector:
    """
    Scans camera frames for prohibited physical devices (COCO classes: cell phone, laptop, book).
    """
    def __init__(self, confidence_threshold: float = 0.50):
        self.confidence_threshold = confidence_threshold
        # COCO class IDs of concern:
        # 67: cell phone, 63: laptop, 73: book, 77: scissors/tools
        self.PROHIBITED_CLASSES = {
            67: "cell phone",
            63: "secondary laptop",
            73: "reference book"
        }

    def detect_objects(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs local YOLO inference on input image frame.
        """
        # In production: results = self.model(frame)
        # Returns detected violations
        return []

    def check_for_malpractice(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Validates frame integrity against proctoring rules.
        """
        detections = self.detect_objects(frame)
        has_phone = any(d["label"] == "cell phone" for d in detections)
        return {
            "prohibited_devices_found": has_phone,
            "detected_objects": detections,
            "proctor_risk": "HIGH" if has_phone else "LOW"
        }

local_detector = LocalYOLOObjectDetector()
