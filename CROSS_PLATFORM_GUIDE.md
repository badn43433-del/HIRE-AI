# HireShield AI - Universal Cross-Platform Architecture Guide
## Single Codebase: Web, Android (Expo Go SDK 57.0.9), and iOS (Expo Go SDK 57.0.9)

---

## 📱 Cross-Platform Architecture Overview

HireShield AI is engineered to run from a **single, unified codebase** across:
1. **Desktop & Mobile Web Browsers** (Chrome, Firefox, Safari, Edge via React Native Web)
2. **Android Devices & Emulators** via Expo Go SDK 57.0.9
3. **Apple iOS Devices & Simulators** via Expo Go SDK 57.0.9
4. **Backend Server** (FastAPI with 100% Local Open-Source AI: OpenCV, MediaPipe, YOLO, Whisper)

```
                    +------------------------------------+
                    |        HireShield AI Client        |
                    |     (Single Cross-Platform App)    |
                    +------------------------------------+
                     /                 |                \
                    /                  |                 \
     +-------------------+    +-------------------+    +-------------------+
     |    Web Browser    |    |   Android Device  |    |     iOS Device    |
     | React Native Web  |    | Expo Go SDK 57    |    | Expo Go SDK 57    |
     +-------------------+    +-------------------+    +-------------------+
                    \                  |                 /
                     \                 |                /
                      v                v               v
                    +------------------------------------+
                    |       FastAPI AI Backend Engine    |
                    |  - JWT Authentication & RBAC       |
                    |  - MediaPipe 468-pt FaceMesh       |
                    |  - OpenCV solvePnP Gaze Vector     |
                    |  - YOLOv8 Prohibited Device Check  |
                    |  - Whisper Speech-to-Text          |
                    |  - Scikit-Learn Semantic Scorer    |
                    +------------------------------------+
                                       |
                                       v
                    +------------------------------------+
                    |   Supabase PostgreSQL 16 Database  |
                    |    (RLS Security & Audit Logs)     |
                    +------------------------------------+
```

---

## 🛠️ Tech Stack & Compatibility Standards

- **Cross-Platform UI Framework**: React Native + React Native Web
- **SDK**: Expo SDK 57.0.9 (Compatible with Expo Go)
- **File-Based Routing**: Expo Router (`app/`)
- **Styling**: NativeWind (Tailwind CSS for React Native & Web)
- **Data Fetching & Caching**: TanStack Query (React Query v5)
- **Form Management**: React Hook Form
- **Backend**: FastAPI (Python 3.11) with WebSockets
- **Database & Storage**: Supabase (PostgreSQL 16 with Row Level Security)
- **AI Processing**: 100% On-Server Open-Source Models (No heavy inference on mobile devices; zero paid third-party AI APIs)

---

## 🚀 Running on Every Target Platform

### 1. Running on Web Browser (Active Dev Server)
The Vite/Node web dev server is active on:
```bash
npm run dev
```
**Access in Browser:** [http://localhost:3000](http://localhost:3000)

### 2. Running in Expo Go (Android & iOS)
To launch the universal Expo Go bundler:
```bash
npx expo start
```
- **Android Physical Device**: Open the **Expo Go** app on your Android phone and scan the displayed QR code.
- **iOS Physical Device**: Open the standard Camera app on your iPhone and scan the displayed QR code to launch in Expo Go.
- **Android Emulator**: Press `a` in the terminal to launch on the Android emulator.
- **iOS Simulator**: Press `i` in the terminal to launch on the macOS iOS simulator.
- **Web Browser (Metro Bundler)**: Press `w` in the terminal to open the Metro web preview at `http://localhost:8081`.

### 3. Running the FastAPI Python Backend
```bash
# 1. Activate environment
source venv/bin/activate  # Or: .\venv\Scripts\activate on Windows

# 2. Start FastAPI Server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔒 Zero External Paid AI Guarantee & Offloading Strategy

To ensure zero device battery drain and universal Expo Go compatibility:
1. **Lightweight Mobile Client**:
   - The mobile client streams lightweight image frames / audio packets to the FastAPI server.
   - It **does not run heavy PyTorch or TensorFlow neural inference on the mobile phone**.
2. **On-Server Neural Pipeline**:
   - The FastAPI backend ingests frames via REST / WebSockets.
   - **MediaPipe FaceMesh**: Computes 3D landmark arrays and gaze vector displacement.
   - **OpenCV 4.10**: Perspective-n-Point head orientation estimation.
   - **YOLOv8**: Detects mobile phones and earphones in the camera frame.
   - **Whisper STT**: Real-time transcript generation without cloud API costs.
   - **Local NLP Evaluator**: Semantic rubric matching using Scikit-Learn TF-IDF cosine similarity.

---

## 🧪 Automated Testing

```bash
# Run backend test suite
pytest backend/tests/ -v

# Run authentication and token tests
pytest backend/tests/test_auth.py -v

# Run AI proctoring and answer scoring tests
pytest backend/tests/test_ai_proctor.py -v
```

---

## 🐳 Docker Production Deployment

Run the complete multi-tier containerized stack with a single command:
```bash
docker compose up --build
```
This initializes:
- PostgreSQL 16 database with pre-loaded `supabase_schema.sql`
- FastAPI Python backend with OpenCV, MediaPipe, Whisper, and YOLO
- Web / Cross-platform frontend service
