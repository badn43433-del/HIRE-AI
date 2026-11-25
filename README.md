# HireShield AI: Enterprise Technical Live Interview Platform
### AI-Powered Proctored Evaluation Suite • 100% Local Open-Source AI

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-61DAFB.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Zero External AI](https://img.shields.io/badge/External%20AI%20APIs-ZERO%20(100%25%20Local)-success.svg)](#zero-paid-external-ai-guarantee)

HireShield AI is a complete, full-stack, enterprise-grade live technical interview platform equipped with automated proctoring, live code compilation, collaborative whiteboard, and multi-modal AI candidate scoring.

---

## 🔒 Zero Paid External AI Guarantee

This platform was built under strict constraints to **never rely on any paid, proprietary, or external SaaS AI API**.

| Restricted Service | HireShield AI Local Open-Source Replacement |
| :--- | :--- |
| **OpenAI / Gemini / Claude API** | **Local Scikit-Learn NLP + TF-IDF Keyword Density Engine** (`backend/ai/evaluator.py`) |
| **Google Cloud Vision / Rekognition** | **Local OpenCV 4.10 + MediaPipe 468-point 3D FaceMesh** (`backend/ai/vision_proctor.py`) |
| **Microsoft Face / Face++ API** | **Local Haar Cascade & MediaPipe Iris Canthus Vectorizer** (`backend/ai/vision_proctor.py`) |
| **Deepgram / AssemblyAI / Whisper Cloud** | **Local OpenAI Whisper Running On-Device** (`backend/ai/audio_analyzer.py`) |
| **Commercial Object Detection SaaS** | **Local Ultralytics YOLOv8 for Mobile Phones & Earbuds** (`backend/ai/object_detector.py`) |

**Result:** Zero API costs, zero data leakage, complete GDPR/SOC-2 privacy, and 100% offline-capable neural inference.

---

## 🌟 Modules & Core Features

### 1. Authentication & Security
- **Role Selection**: Toggle between **Candidate**, **Interviewer**, and **Admin**.
- **1-Click Sandbox Credentials**: Quick-fill demo credentials for instant evaluation.
- **Two-Factor Authentication (2FA)**: 6-digit OTP verification modal (`849201`).
- **Password Reset & Account Registration**: Fully self-service onboarding flows.

### 2. Candidate Dashboard & Live Interview Suite
- **Upcoming Scheduled Interviews**: View assigned rounds, countdowns, and lead interviewers.
- **Hardware & Pre-Flight Diagnostics**:
  - Live 1080p WebRTC camera check with face-framing indicators.
  - Real-time AudioContext decibel meter measuring voice levels and noise floor.
  - Bandwidth & Latency speed test (Ping, Jitter, Download Mbps, Upload Mbps).
  - Browser capabilities check (WebRTC, Canvas 2D, Screen Sharing, Fullscreen API).
- **Virtual Waiting Room**: Live queue position, conduct guidelines, and admission timer.
- **Live Assessment Suite**:
  - **Dual HD Video Layout**: Candidate webcam + Interviewer stream with live voice visualizer.
  - **Live Coding Editor**: Language switcher (TypeScript, JavaScript, Python, C++, Java), syntax styling, and test runner with terminal stdout and execution duration.
  - **Collaborative Whiteboard Canvas**: HTML5 canvas with Pen, Line, Rectangle, Circle, Eraser, color palette, and one-click PNG architecture diagram export.
  - **Live Chat**: Instant messaging with technical emergency flags and file attachments.
  - **Media Controls**: Mic mute, camera pause, screen share, raise hand, fullscreen, network quality indicator, and interview timer.
- **AI Proctoring HUD Overlay**:
  - Face verification & multi-person alert.
  - MediaPipe eye-gaze tracking indicator (`Center`, `Diverted`).
  - Affect/Emotion radar (`Focused`, `Confident`, `Stressed`).
  - Whisper Speech-to-Text transcript ticker.
  - Tab-switch and clipboard copy-paste detector with dynamic trust score reduction.
- **Candidate Scorecards & Profile**: Verified skills tags, resume upload (PDF/DOCX), and evaluation scorecards.

### 3. Interviewer Dashboard & Co-Pilot Console
- **Candidate Pipeline**: Schedule new interviews and dispatch calendar invitations.
- **Parsed Resume Viewer**: In-app modal preview of candidate experience and verified skills.
- **Live Co-Pilot Console**:
  - Real-time candidate stream audit.
  - **AI Question Prompts**: Automated follow-up question suggestions based on candidate code.
  - **Challenge Dispatcher**: Push algorithmic problems directly to the candidate's code editor.
  - **5-Point Rubric Scoring**: Technical competence, algorithm quality, system design, communication, and problem solving.
  - **Hiring Verdict**: Select `Strong Hire`, `Hire`, `Leaning Hire`, or `Reject`.
- **Candidate Comparison Matrix**: Side-by-side benchmark comparison of shortlisted finalists.

### 4. Admin Dashboard & Executive Analytics
- **Platform Analytics**: Total completed interviews (1,428), active live rooms, platform average trust index (94.8%), and malpractice flag distribution.
- **User Management (RBAC)**: Manage Candidates, Interviewers, and Admins; create new accounts, and suspend/activate accounts.
- **Live NOC Video Wall**: Multi-tile surveillance grid of all active assessment rooms with trust scores.
- **AI Proctoring Center**: In-depth telemetry monitoring MediaPipe, YOLOv8 object detections, and Whisper STT.
- **Immutable Audit Logs**: Chronological SOC-2 compliance trail tracking IP addresses, actions, and security alerts.
- **System Settings**: Configure proctoring strictness (`Warning`, `Strict Lockdown`, `Audit Only`), gaze tolerance thresholds, and 2FA enforcement.

---

## 🚀 Quickstart & Installation

### Option 1: Full-Stack Vite + Node Runner (Recommended for Instant Evaluation)

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the Live Application:**
   ```bash
   npm run dev
   ```

3. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

### Option 2: Running with FastAPI Python Backend

1. **Setup Python Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. **Install Python AI & Backend Dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Launch FastAPI Backend Server:**
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   FastAPI interactive OpenAPI docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

4. **Launch React Frontend:**
   ```bash
   npm run dev
   ```

---

### Option 3: Docker Compose (Production Stack)

Run the entire platform including PostgreSQL 16, FastAPI Backend, and React Frontend in a single command:

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🧪 Testing Guide

Run automated unit and integration tests across the backend and AI scoring pipelines:

```bash
# Run all unit tests
pytest backend/tests/ -v

# Run authentication and JWT test suite
pytest backend/tests/test_auth.py -v

# Run local AI proctoring and answer evaluator tests
pytest backend/tests/test_ai_proctor.py -v
```

---

## 📚 REST API Documentation

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Create new candidate/interviewer account |
| `/api/auth/login` | `POST` | Public | Authenticate credentials and issue 2FA challenge |
| `/api/auth/verify-otp` | `POST` | Public | Verify 6-digit OTP code and return JWT token |
| `/api/candidates/interviews` | `GET` | Candidate | List assigned upcoming scheduled interviews |
| `/api/candidates/diagnostics` | `POST` | Candidate | Log workstation camera/mic/speed test health |
| `/api/interviews/execute-code` | `POST` | All | Run code in isolated sandbox and execute test cases |
| `/api/interviews/submit-evaluation` | `POST` | All | Submit answers for local AI evaluation |
| `/api/proctor/alert` | `POST` | Client | Ingest malpractice event (tab switch, mobile phone) |
| `/api/admin/analytics` | `GET` | Admin | Retrieve platform KPIs and flag distributions |
| `/api/admin/settings` | `PUT` | Admin | Update global strictness and AI sensitivity thresholds |
| `/ws/rooms/{session_id}` | `WebSocket` | All | Real-time WebRTC signaling, code sync, whiteboard, and chat |

---

## 🎓 Capstone Project Alignment

HireShield AI demonstrates:
1. **Computer Vision**: Perspective-n-Point 3D head pose estimation, iris displacement vectors, and YOLO object detection.
2. **Natural Language Processing**: Local lexical density analysis, TF-IDF cosine similarity, and structured rubric grading.
3. **Distributed Systems**: P2P WebRTC mesh streaming, WebSocket connection multiplexing, and isolated code execution sandboxes.
4. **Security & Cryptography**: JWT rotation, 2FA OTP tokens, immutable audit trails, and browser sandbox defense.
