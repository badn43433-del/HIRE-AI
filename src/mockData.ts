/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  UserProfile, 
  ScheduledInterview, 
  CodingChallenge, 
  SystemAuditLog, 
  AdminSystemSettings 
} from "./types";

export const MOCK_USERS: UserProfile[] = [
  {
    id: "user-cand-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@enterprise-recruit.com",
    role: "candidate",
    department: "Frontend Engineering",
    status: "active",
    createdAt: "2026-09-12T09:30:00Z",
    twoFactorEnabled: true,
  },
  {
    id: "user-cand-2",
    name: "David Chen",
    email: "david.chen@cloudscale.net",
    role: "candidate",
    department: "Backend & Distributed Systems",
    status: "active",
    createdAt: "2026-09-20T14:15:00Z",
    twoFactorEnabled: false,
  },
  {
    id: "user-cand-3",
    name: "Amara Diallo",
    email: "amara.diallo@neuroai.org",
    role: "candidate",
    department: "AI & Machine Learning",
    status: "active",
    createdAt: "2026-10-01T11:00:00Z",
    twoFactorEnabled: true,
  },
  {
    id: "user-int-1",
    name: "Marcus Vance",
    email: "marcus.vance@techcorp.io",
    role: "interviewer",
    department: "Staff Engineering Lead",
    status: "active",
    createdAt: "2025-11-04T08:00:00Z",
    twoFactorEnabled: true,
  },
  {
    id: "user-int-2",
    name: "Dr. Rachel Kim",
    email: "rachel.kim@techcorp.io",
    role: "interviewer",
    department: "Head of AI Research",
    status: "active",
    createdAt: "2025-08-15T10:00:00Z",
    twoFactorEnabled: true,
  }
];

export const MOCK_SCHEDULED_INTERVIEWS: ScheduledInterview[] = [
  {
    id: "int-live-101",
    candidateId: "user-cand-1",
    candidateName: "Sarah Jenkins",
    candidateEmail: "sarah.jenkins@enterprise-recruit.com",
    interviewerId: "user-int-1",
    interviewerName: "Marcus Vance",
    interviewerEmail: "marcus.vance@techcorp.io",
    positionId: "pos-1",
    roleTitle: "Senior Frontend UI Architect",
    department: "Engineering",
    scheduledDate: "Today",
    scheduledTime: "14:00 PM EST",
    durationMinutes: 45,
    status: "scheduled",
    meetingLink: "https://hireshield.live/meet/int-live-101",
    resumeUrl: "/resumes/sarah_jenkins_lead_fe.pdf",
    skills: ["React 19", "TypeScript", "WebSockets", "Vite", "State Machines", "Security Sandboxing"]
  },
  {
    id: "int-live-102",
    candidateId: "user-cand-2",
    candidateName: "David Chen",
    candidateEmail: "david.chen@cloudscale.net",
    interviewerId: "user-int-1",
    interviewerName: "Marcus Vance",
    interviewerEmail: "marcus.vance@techcorp.io",
    positionId: "pos-2",
    roleTitle: "Cybersecurity & Proctoring Architect",
    department: "Security Operations",
    scheduledDate: "Tomorrow",
    scheduledTime: "11:00 AM EST",
    durationMinutes: 60,
    status: "scheduled",
    meetingLink: "https://hireshield.live/meet/int-live-102",
    skills: ["Zero Trust", "WebRTC E2EE", "OAuth/JWT", "Kernel Sandboxing", "Python"]
  },
  {
    id: "int-live-103",
    candidateId: "user-cand-3",
    candidateName: "Amara Diallo",
    candidateEmail: "amara.diallo@neuroai.org",
    interviewerId: "user-int-2",
    interviewerName: "Dr. Rachel Kim",
    interviewerEmail: "rachel.kim@techcorp.io",
    positionId: "pos-3",
    roleTitle: "AI & NLP Platform Alchemist",
    department: "Applied AI",
    scheduledDate: "Oct 22, 2026",
    scheduledTime: "16:30 PM EST",
    durationMinutes: 45,
    status: "scheduled",
    meetingLink: "https://hireshield.live/meet/int-live-103",
    skills: ["PyTorch", "Whisper", "MediaPipe", "LLM Inference", "FastAPI"]
  }
];

export const MOCK_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: "code-algo-1",
    title: "Optimized WebSocket Debounce & Message Queue",
    difficulty: "Medium",
    language: "typescript",
    description: `Implement a high-throughput message throttle queue in TypeScript that batches rapid telemetry signals emitted every 10ms into consolidated 200ms payloads without dropping critical malpractice alerts.
    
Write a class \`TelemetryQueue\` with methods:
- \`push(event: MalpracticeSignal): void\`
- \`flush(): MalpracticeSignal[]\`
- \`hasUrgentFlag(): boolean\``,
    starterCode: `interface MalpracticeSignal {
  type: string;
  severity: "low" | "medium" | "high";
  timestamp: number;
}

export class TelemetryQueue {
  private buffer: MalpracticeSignal[] = [];

  constructor(private flushIntervalMs: number = 200) {}

  push(event: MalpracticeSignal): void {
    // Sort-on-insert: high-severity events surface at the front of the queue
    if (event.severity === "high") {
      this.buffer.unshift(event);
    } else {
      this.buffer.push(event);
    }
  }

  flush(): MalpracticeSignal[] {
    // Return all buffered events and clear internal memory
    const items = [...this.buffer];
    this.buffer = [];
    return items;
  }

  hasUrgentFlag(): boolean {
    return this.buffer.some(e => e.severity === "high");
  }
}

// Verification Runner
const queue = new TelemetryQueue(200);
queue.push({ type: "eye_gaze_divert", severity: "medium", timestamp: Date.now() });
queue.push({ type: "second_face_detected", severity: "high", timestamp: Date.now() });
console.log("Urgent status:", queue.hasUrgentFlag());
console.log("Flushed items:", queue.flush().length);
`,
    testCases: [
      { input: "push medium + push high", expected: "hasUrgentFlag() === true" },
      { input: "flush() after 2 items", expected: "returns length 2 & empties queue" }
    ]
  },
  {
    id: "code-algo-2",
    title: "LRU Cache for AI Proctoring Frames",
    difficulty: "Hard",
    language: "python",
    description: `Design a thread-safe Least Recently Used (LRU) Cache in Python to store the last N video frame hashes generated by OpenCV face verification to prevent memory exhaustion on high-resolution streams.
    
Implement \`FrameLRUCache(capacity: int)\` with:
- \`get(frame_id: str) -> bytes\`
- \`put(frame_id: str, frame_bytes: bytes) -> None\``,
    starterCode: `class FrameLRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        # Hint: Maintain insertion/access order

    def get(self, frame_id: str):
        if frame_id not in self.cache:
            return None
        # Move accessed item to end
        val = self.cache.pop(frame_id)
        self.cache[frame_id] = val
        return val

    def put(self, frame_id: str, frame_bytes: bytes) -> None:
        if frame_id in self.cache:
            self.cache.pop(frame_id)
        elif len(self.cache) >= self.capacity:
            # Evict oldest item
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[frame_id] = frame_bytes

# Test Driver
cache = FrameLRUCache(capacity=2)
cache.put("frame_1", b"\\x01\\x02")
cache.put("frame_2", b"\\x03\\x04")
print("Get frame_1:", cache.get("frame_1") is not None)
cache.put("frame_3", b"\\x05\\x06")
print("Evicted frame_2?", cache.get("frame_2") is None)
`,
    testCases: [
      { input: "Capacity 2, insert 1, 2, get 1, insert 3", expected: "Evicts frame_2, retains 1 and 3" }
    ]
  },
  {
    id: "code-algo-3",
    title: "Real-time Gaze Vector Angle Calculator",
    difficulty: "Medium",
    language: "javascript",
    description: `Given 3D facial landmark coordinates from MediaPipe (iris center and eye corners), compute the angular deviation in degrees relative to the camera optical axis. Return true if deviation exceeds threshold degrees for > 3.0 seconds.`,
    starterCode: `function isGazeDiverted(eyeCoordinates, thresholdDegrees = 25) {
  // eyeCoordinates: { iris: [x,y,z], innerCorner: [x,y,z], outerCorner: [x,y,z] }
  const eyeCenterX = (eyeCoordinates.innerCorner[0] + eyeCoordinates.outerCorner[0]) / 2;
  const irisOffsetX = eyeCoordinates.iris[0] - eyeCenterX;
  
  // Approximate horizontal visual angle in degrees
  const angleDegrees = Math.abs(irisOffsetX) * 90;
  
  return {
    angleDegrees: Math.round(angleDegrees * 10) / 10,
    diverted: angleDegrees > thresholdDegrees
  };
}

// Verification test
const testCoord = {
  iris: [0.65, 0.45, 0.02],
  innerCorner: [0.48, 0.45, 0.01],
  outerCorner: [0.52, 0.45, 0.01]
};
console.log("Calculated Gaze:", isGazeDiverted(testCoord));
`,
    testCases: [
      { input: "Iris offset > 0.15", expected: "diverted: true (>25 degrees)" }
    ]
  }
];

export const MOCK_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: "audit-001",
    timestamp: "2026-10-18T13:30:15Z",
    actor: "Lead Interviewer Marcus Vance",
    role: "interviewer",
    action: "UPDATE_SYSTEM_STRICTNESS",
    ipAddress: "192.168.1.104",
    details: "Changed proctoring strictness from 'warning' to 'strict'.",
    status: "SUCCESS"
  },
  {
    id: "audit-002",
    timestamp: "2026-10-18T13:12:44Z",
    actor: "Candidate Sarah Jenkins",
    role: "candidate",
    action: "SESSION_AUTHENTICATE",
    ipAddress: "172.56.21.89",
    details: "Completed 2FA OTP verification and joined virtual waiting room.",
    status: "SUCCESS"
  },
  {
    id: "audit-003",
    timestamp: "2026-10-18T12:55:00Z",
    actor: "AI Proctor Engine (Node-Worker-04)",
    role: "interviewer",
    action: "MALPRACTICE_FLAG_RECORDED",
    ipAddress: "10.0.4.12",
    details: "Candidate David Chen triggered browser tab blur for 8.4 seconds during live coding challenge.",
    status: "WARNING"
  },
  {
    id: "audit-004",
    timestamp: "2026-10-18T11:40:22Z",
    actor: "Interviewer Marcus Vance",
    role: "interviewer",
    action: "EVALUATION_SUBMITTED",
    ipAddress: "73.119.42.18",
    details: "Recorded final rubric score: 4.8/5.0 with recommendation 'STRONG_HIRE'.",
    status: "SUCCESS"
  },
  {
    id: "audit-005",
    timestamp: "2026-10-18T10:15:00Z",
    actor: "System Sentinel",
    role: "interviewer",
    action: "UNAUTHORIZED_ACCESS_BLOCKED",
    ipAddress: "185.220.101.5",
    details: "Blocked unauthorized access attempt without valid JWT token.",
    status: "BLOCKED"
  }
];

export const DEFAULT_ADMIN_SETTINGS: AdminSystemSettings = {
  strictness: "warning",
  faceMeshSensitivity: 85,
  gazeToleranceSeconds: 5,
  allowCopyPaste: false,
  enableMultiplePersonAlerts: true,
  enableMobilePhoneDetection: true,
  autoMailReports: true,
  jwtExpiryMinutes: 120,
  twoFactorRequired: true
};
