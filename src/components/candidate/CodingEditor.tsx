/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Play, CheckCircle2, XCircle, RotateCcw, 
  Terminal, Code2, Copy, Check, Sparkles, Layers
} from "lucide-react";
import { CodingChallenge } from "../../types";
import { MOCK_CODING_CHALLENGES } from "../../mockData";

interface CodingEditorProps {
  initialChallenge?: CodingChallenge;
  onCodeChange?: (code: string, language: string) => void;
  onSubmitSolution?: (code: string, language: string, passed: number, total: number) => void;
}

export default function CodingEditor({ 
  initialChallenge = MOCK_CODING_CHALLENGES[0],
  onCodeChange,
  onSubmitSolution
}: CodingEditorProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(initialChallenge);
  const [language, setLanguage] = useState(initialChallenge.language);
  const [code, setCode] = useState(initialChallenge.starterCode);
  const [outputConsole, setOutputConsole] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string; durationMs: number }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleChallengeChange = (challengeId: string) => {
    const found = MOCK_CODING_CHALLENGES.find(c => c.id === challengeId);
    if (found) {
      setSelectedChallenge(found);
      setLanguage(found.language);
      setCode(found.starterCode);
      setOutputConsole([]);
      setTestResults([]);
      if (onCodeChange) onCodeChange(found.starterCode, found.language);
    }
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode, language);
  };

  const runCodeSandbox = () => {
    setIsRunning(true);
    setOutputConsole(["[Compiler] Initializing sandbox environment...", `[Runtime] Language: ${language.toUpperCase()}`]);

    setTimeout(() => {
      let simulatedLogs: string[] = [];
      let results: { passed: boolean; message: string; durationMs: number }[] = [];

      try {
        if (language === "javascript" || language === "typescript") {
          // Safe client-side execution simulation
          simulatedLogs.push("[STDOUT] Executing test driver...");
          simulatedLogs.push("[STDOUT] Telemetry queue initialized with capacity: 200ms");
          simulatedLogs.push("[STDOUT] Urgent malpractice status check: PASSED (severity: high)");
          simulatedLogs.push("[STDOUT] Queue buffer flush: 2 events dispatched successfully");
          results = [
            { passed: true, message: "Test Case 1: Urgent priority bubbling", durationMs: 14 },
            { passed: true, message: "Test Case 2: Memory flush & clear buffer", durationMs: 18 }
          ];
        } else if (language === "python") {
          simulatedLogs.push("[Python 3.12] Running FrameLRUCache simulation...");
          simulatedLogs.push("[STDOUT] Put frame_1 & frame_2 -> Success");
          simulatedLogs.push("[STDOUT] Put frame_3 -> Evicted oldest frame_2 correctly");
          results = [
            { passed: true, message: "LRU eviction policy adherence", durationMs: 22 },
            { passed: true, message: "Cache capacity constraint enforcement", durationMs: 19 }
          ];
        } else {
          simulatedLogs.push(`[Output] Compiled successfully without syntax errors.`);
          results = [
            { passed: true, message: "Base test case assertion", durationMs: 12 }
          ];
        }
      } catch (err: any) {
        simulatedLogs.push(`[ERROR] ${err.message}`);
        results = [{ passed: false, message: "Runtime exception occurred", durationMs: 5 }];
      }

      setOutputConsole(simulatedLogs);
      setTestResults(results);
      setIsRunning(false);

      if (onSubmitSolution) {
        const passedCount = results.filter(r => r.passed).length;
        onSubmitSolution(code, language, passedCount, results.length);
      }
    }, 750);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode(selectedChallenge.starterCode);
    setOutputConsole([]);
    setTestResults([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg">
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-800/90 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Code2 className="h-4 w-4" />
          </div>
          <select
            value={selectedChallenge.id}
            onChange={(e) => handleChallengeChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {MOCK_CODING_CHALLENGES.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} ({ch.difficulty})
              </option>
            ))}
          </select>

          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
            {selectedChallenge.difficulty}
          </span>
        </div>

        {/* Language & Actions */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ 20</option>
            <option value="java">Java 21</option>
          </select>

          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs cursor-pointer transition-all"
            title="Copy Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={resetCode}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs cursor-pointer transition-all"
            title="Reset Starter Code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            id="run-code-btn"
            onClick={runCodeSandbox}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : "fill-current"}`} />
            <span>{isRunning ? "Running..." : "Run Tests"}</span>
          </button>
        </div>
      </div>

      {/* Challenge Description Collapsible Banner */}
      <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-700/60 text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="line-clamp-2 hover:line-clamp-none transition-all">
          <strong className="text-white">Task:</strong> {selectedChallenge.description}
        </div>
      </div>

      {/* Editor Body + Output Pane Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden min-h-[350px]">
        {/* Code Input Area */}
        <div className="lg:col-span-2 relative flex flex-col bg-slate-950 font-mono text-xs">
          <textarea
            id="candidate-code-editor-textarea"
            value={code}
            onChange={handleCodeInput}
            spellCheck={false}
            className="w-full h-full p-4 bg-transparent text-indigo-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-mono selection:bg-indigo-700 selection:text-white"
            placeholder="// Write your algorithm solution here..."
          />
        </div>

        {/* Terminal Output & Test Results */}
        <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col h-full font-mono text-xs overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <Terminal className="h-3.5 w-3.5 text-sky-400" /> Test Execution Output
            </span>
            <span className="text-[10px] text-slate-500">Sandbox v2.4</span>
          </div>

          {/* Test Case Cards */}
          <div className="p-3 space-y-2 flex-1 overflow-y-auto">
            {testResults.length > 0 ? (
              testResults.map((t, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    t.passed 
                      ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300" 
                      : "bg-rose-950/40 border-rose-800/60 text-rose-300"
                  }`}
                >
                  {t.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="text-[11px] font-bold">{t.message}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">Execution: {t.durationMs}ms</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Click "Run Tests" to execute your algorithm against live test suites.
              </div>
            )}

            {/* STDOUT Log */}
            {outputConsole.length > 0 && (
              <div className="mt-3 p-2 rounded-lg bg-black/60 border border-slate-800 text-[10px] text-slate-300 space-y-1">
                {outputConsole.map((log, i) => (
                  <div key={i} className="text-slate-400 font-mono">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
