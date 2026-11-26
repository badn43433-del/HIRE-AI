/**
 * HireShield AI - TypeScript End-to-End Verification Runner
 * Run with: npx tsx e2e/runner.ts
 */

const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<string>) {
  try {
    const detail = await fn();
    results.push({ name, passed: true, detail });
    console.log(`✅ [PASS] ${name} - ${detail}`);
  } catch (err: any) {
    results.push({ name, passed: false, detail: err?.message || String(err) });
    console.error(`❌ [FAIL] ${name} - ${err?.message || err}`);
  }
}

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log(`Running HireShield AI E2E Suite against ${BASE_URL}...\n`);

  // 1. SPA Health
  await runTest("E2E-01: Landing SPA loads HTML", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const html = await res.text();
    assert(html.includes("HireShield AI"), "Missing HireShield AI title");
    return "HTTP 200 OK";
  });

  // 2. CORS preflight check
  await runTest("E2E-02: CORS OPTIONS preflight", async () => {
    const res = await fetch(`${BASE_URL}/api/positions`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:8081" },
    });
    assert(res.status === 204, `Expected 204, got ${res.status}`);
    return "CORS preflight 204 OK";
  });

  // 3. Malformed JSON returns clean 400 JSON
  await runTest("E2E-03: Malformed JSON returns 400 JSON", async () => {
    const res = await fetch(`${BASE_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad-json",
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const body = await res.json();
    assert(typeof body.error === "string", "Expected JSON error message");
    return `400 JSON: ${body.error}`;
  });

  // 4. Empty session input rejected
  await runTest("E2E-04: Empty session fields rejected (400)", async () => {
    const res = await fetch(`${BASE_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateName: "   ", candidateEmail: "", jobId: "" }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    return "Whitespace/empty inputs rejected";
  });

  // 5. Invalid OTP rejected
  await runTest("E2E-05: Invalid 2FA OTP rejected (400)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@local.dev", otp_code: "000000", role: "candidate" }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    return "Invalid OTP rejected";
  });

  // 6. Full Session -> Proctor Event -> Chat -> Submit -> Report Status Flow
  let createdSessionId = "";
  let createdReportId = "";
  await runTest("E2E-06: Full Interview Session & AI Evaluation Flow", async () => {
    const posRes = await fetch(`${BASE_URL}/api/positions`);
    const positions = await posRes.json();
    assert(Array.isArray(positions) && positions.length > 0, "No positions returned");

    const sesRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateName: "E2E Runner Candidate",
        candidateEmail: "e2e.runner@test.local",
        jobId: positions[0].id,
      }),
    });
    assert(sesRes.status === 200, `Create session failed: ${sesRes.status}`);
    const ses = await sesRes.json();
    createdSessionId = ses.id;

    const evtRes = await fetch(`${BASE_URL}/api/sessions/${createdSessionId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "tab_switch",
        description: "E2E Runner focus blur",
        severity: "low",
        videoOffsetSeconds: 10,
      }),
    });
    assert(evtRes.status === 200, "Event log failed");

    const subRes = await fetch(`${BASE_URL}/api/sessions/${createdSessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        responses: [
          {
            questionText: "Explain React render optimization",
            answerText: "Batch WebSocket updates with debounce and memoize with useMemo and React.memo.",
            durationSeconds: 30,
            transcriptText: "Batch WebSocket updates...",
          },
        ],
      }),
    });
    assert(subRes.status === 200, `Submit failed: ${subRes.status}`);
    const sub = await subRes.json();
    createdReportId = sub.report?.id;
    assert(Boolean(createdReportId), "Missing report ID");
    return `Session ${createdSessionId} -> Report ${createdReportId} (${sub.report.shortlistStatus})`;
  });

  // 7. Groq AI Chat validation & live call
  await runTest("E2E-07: AI Chat rejects empty messages (400)", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    return "Empty AI chat rejected cleanly";
  });

  await runTest("E2E-08: AI Chat live response", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Reply with OK" }],
        roleContext: "candidate",
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(typeof data.reply === "string" && data.reply.length > 0, "Empty AI reply");
    return `Model=${data.model} | Reply=${data.reply}`;
  });

  // 9. Sign-up -> Immediate Login (Case/Whitespace normalization & persisted userId)
  await runTest("E2E-09: Sign-Up & Immediate Login (User ID persisted)", async () => {
    const uniqueEmail = `e2e.user.${Date.now()}@TestDomain.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Registered User",
        email: `  ${uniqueEmail}  `,
        password: "securePass123",
        role: "interviewer",
      }),
    });
    assert(regRes.status === 201, `Register failed: ${regRes.status}`);
    const regData = await regRes.json();
    assert(Boolean(regData.user?.id), "No user ID returned on register");

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail.toLowerCase(),
        password: "securePass123",
      }),
    });
    assert(loginRes.status === 200, `Immediate login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    assert(loginData.user?.id === regData.user.id, "Login user ID mismatch");
    return `Registered & logged in user ${loginData.user.id} (${loginData.user.role})`;
  });

  const failed = results.filter((r) => !r.passed).length;
  console.log(`\nSummary: ${results.length - failed}/${results.length} passed`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
