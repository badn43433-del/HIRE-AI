import React, { useState, useEffect, useRef } from "react";
import { 
  AlertTriangle, ShieldAlert, Eye, Clock, User, Send,
  Search, RefreshCw, Layers, CheckSquare, Bell, Filter
} from "lucide-react";
import { motion } from "motion/react";

interface AlertItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  type: string;
  timestamp: string;
  description: string;
  severity: "low" | "medium" | "high";
}

interface AlertsTabProps {
  onSelectReportFromAlert: (candidateEmail: string) => void;
}

export default function AlertsTab({ onSelectReportFromAlert }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Live Helpdesk states
  const [activeSection, setActiveSection] = useState<"alarms" | "helpdesk">("alarms");
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionChats, setSessionChats] = useState<any[]>([]);
  const [hrResponseText, setHrResponseText] = useState("");
  const [activeSessionEmergency, setActiveSessionEmergency] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // Fetch both reports and standard sessions to compile suspicious events
      const reportsResponse = await fetch("/api/reports");
      const reportsData = await reportsResponse.json();

      const calculatedAlerts: AlertItem[] = [];

      // Add seed / standard logged alerts from candidate profiles if any or compile from the database sessions
      const sessionsResponse = await fetch("/api/sessions");
      let sessionsData: any[] = [];
      try {
        if (sessionsResponse.ok) {
          sessionsData = await sessionsResponse.json();
        }
      } catch (e) {
        // Safe check
      }

      // Append real activities from active sessions as well
      sessionsData.forEach((ses: any) => {
        (ses.suspiciousActivities || []).forEach((act: any) => {
          calculatedAlerts.push({
            id: `alt-live-${act.id}`,
            candidateName: ses.candidateName,
            candidateEmail: ses.candidateEmail,
            type: act.type,
            timestamp: act.timestamp || new Date().toISOString(),
            description: `[Live Stream Alert] ${act.description}`,
            severity: act.severity
          });
        });
      });

      reportsData.forEach((rep: any) => {
        if (rep.suspiciousActivities && rep.suspiciousActivities.length > 0) {
          rep.suspiciousActivities.forEach((act: any) => {
            calculatedAlerts.push({
              id: `alt-rep-${act.id}`,
              candidateName: rep.candidateName,
              candidateEmail: rep.candidateEmail,
              type: act.type,
              timestamp: act.timestamp || new Date().toISOString(),
              description: act.description,
              severity: act.severity
            });
          });
        } else {
          // Fallback parsing
          if (rep.suspicionScore > 60) {
            calculatedAlerts.push({
              id: `alt-${rep.id}-1`,
              candidateName: rep.candidateName,
              candidateEmail: rep.candidateEmail,
              type: "tab_switch",
              timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
              description: "Critical Warning: Multiple background browser tab transitions and window focus hiding captured mid-assessment.",
              severity: "high"
            });
          } else if (rep.suspicionScore > 15) {
            calculatedAlerts.push({
              id: `alt-${rep.id}-3`,
              candidateName: rep.candidateName,
              candidateEmail: rep.candidateEmail,
              type: "focus_lost",
              timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
              description: "Warning: User briefly clicked outside sandbox proctor boundaries. Focus restored after 4 seconds.",
              severity: "medium"
            });
          }
        }
      });

      // Sort by timestamp descending
      setAlerts(calculatedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    } catch (err) {
      console.error("Error compilation alerts", err);
      // Fallback alerts
      setAlerts([
        {
          id: "alt-mock-1",
          candidateName: "David Chen",
          candidateEmail: "david.chen@ai-systems.co",
          type: "tab_switch",
          timestamp: new Date().toISOString(),
          description: "CRITICAL: Candidate switched browser tabs 5 distinct times during active appraisal.",
          severity: "high"
        },
        {
          id: "alt-mock-2",
          candidateName: "Marcus Thorne",
          candidateEmail: "marcus.t@defense-network.io",
          type: "focus_lost",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          description: "Candidate blurred focus by clicking inside an external window display midway.",
          severity: "medium"
        }
      ]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Live Helpdesk polling
  const loadActiveSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setActiveSessions(data);
      }
    } catch (e) {
      console.error("Error loading active sessions:", e);
    }
  };

  useEffect(() => {
    loadActiveSessions();
    const interval = setInterval(loadActiveSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Poll chats for selected session
  const loadSelectedChats = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}/chats`);
      if (res.ok) {
        const data = await res.json();
        setSessionChats(data.chats || []);
        setActiveSessionEmergency(data.supportEmergencyActive);
      }
    } catch (e) {
      console.error("Error loading selected chats:", e);
    }
  };

  useEffect(() => {
    if (!selectedSessionId) return;
    loadSelectedChats(selectedSessionId);
    const interval = setInterval(() => loadSelectedChats(selectedSessionId), 2500);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessionChats]);

  const handleHrSendResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSessionId || !hrResponseText.trim()) return;

    const textToSubmit = hrResponseText.trim();
    setHrResponseText("");

    try {
      const res = await fetch(`/api/sessions/${selectedSessionId}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "hr",
          text: textToSubmit
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSessionChats(prev => [...prev, data.message]);
        setActiveSessionEmergency(data.supportEmergencyActive);
        // Refresh session briefs
        loadActiveSessions();
      }
    } catch (err) {
      console.error("Error sending response from HR:", err);
    }
  };

  const handleHrToggleEmergency = async () => {
    if (!selectedSessionId) return;
    const toggledState = !activeSessionEmergency;
    try {
      const res = await fetch(`/api/sessions/${selectedSessionId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: toggledState,
          text: toggledState
            ? "🚨 SYSTEM ASSIST: HR Support Team flagged active workspace difficulties."
            : "✅ TECHNICAL EMERGENCY RESOLVED: HR Support marked technical conflicts as fully resolved."
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSessionEmergency(toggledState);
        setSessionChats(data.chats);
        loadActiveSessions();
      }
    } catch (err) {
      console.error("Error toggling emergency from HR:", err);
    }
  };

  const filteredAlerts = alerts.filter(alt => {
    const matchesSearch = alt.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || alt.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Metrics of proctors Alarms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white/85">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-red-500/10 to-transparent blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Live Emergency Signals</span>
          <span className={`text-3xl font-heading font-extrabold mt-1 block ${
            activeSessions.some(s => s.supportEmergencyActive) ? "text-rose-600 animate-pulse" : "text-emerald-600"
          }`}>
            {activeSessions.filter(s => s.supportEmergencyActive).length} Active
          </span>
          <span className="text-[11px] text-slate-500 block mt-2 font-mono flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" /> Signals requiring immediate advice
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white/85">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-slate-500/0 block blur-md rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Total Suspicious Flags</span>
          <span className="text-3xl font-heading font-extrabold text-amber-555 text-amber-600 mt-1 block">
            {alerts.filter(a => a.severity === "high" || a.severity === "medium").length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-2 font-mono flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> Sandbox focus-loss counts
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white/85">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-semibold">Connected Sessions</span>
          <span className="text-3xl font-heading font-extrabold text-indigo-650 text-indigo-600 mt-1 block">
            {activeSessions.length} Online
          </span>
          <span className="text-[11px] text-slate-500 block mt-2 font-mono flex items-center gap-1">
            <Clock className="h-4 w-4 text-emerald-500 shrink-0" /> Parallel assessment slots monitored
          </span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        
        {/* Navigation Switch Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSection("alarms")}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 text-center cursor-pointer ${
              activeSection === "alarms"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            🛡 Proctoring Incident Logs
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveSection("helpdesk");
              loadActiveSessions();
            }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 text-center cursor-pointer relative flex items-center justify-center gap-2 ${
              activeSection === "helpdesk"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>🆘 Live Technical Helpdesk</span>
            {activeSessions.some(s => s.supportEmergencyActive) && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>

        {activeSection === "alarms" ? (
          <div className="space-y-4">
            {/* Navigation / Filter Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="text-indigo-600 h-5 w-5 animate-pulse" />
                <h3 className="text-sm font-heading font-bold text-slate-800">Proctoring Telemetry Alarm Log</h3>
              </div>
              <button 
                onClick={loadAlerts}
                className="text-xs font-mono text-slate-600 hover:text-slate-950 flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded shadow-sm transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Force Telemetry Poll
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query Name, Email, or Alert detail..."
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select 
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                >
                  <option value="all">Severity: All Alarms</option>
                  <option value="high">High Severity Only</option>
                  <option value="medium">Medium Severity Only</option>
                  <option value="low">Low Severity Only</option>
                </select>
              </div>
            </div>

            {/* Alarms Roll list */}
            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">
                Accessing proctoring socket lines...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-505">
                Zero security violations logged in current window frame.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alt) => (
                  <div 
                    key={alt.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-start justify-between shadow-sm transition-colors ${
                      alt.severity === "high" 
                        ? "bg-rose-50/20 border-rose-100" 
                        : alt.severity === "medium"
                        ? "bg-amber-50/20 border-amber-100"
                        : "bg-emerald-50/20 border-emerald-100"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-2 rounded-lg border mt-0.5 shrink-0 ${
                        alt.severity === "high" 
                          ? "bg-rose-50 border-rose-200 text-rose-600" 
                          : alt.severity === "medium"
                          ? "bg-amber-50 border-amber-200 text-amber-500"
                          : "bg-emerald-50 border-emerald-200 text-emerald-500"
                      }`}>
                        {alt.severity === "high" ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : alt.severity === "medium" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" /> {alt.candidateName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({alt.candidateEmail})</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-semibold ${
                            alt.severity === "high" 
                              ? "bg-rose-100 text-rose-800" 
                              : alt.severity === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {alt.severity.toUpperCase()} ALERT
                          </span>
                        </div>
                        <p className="text-xs text-slate-650 text-slate-600 font-sans leading-relaxed">{alt.description}</p>
                        
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(alt.timestamp).toLocaleTimeString()} ({new Date(alt.timestamp).toLocaleDateString()})</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0">
                      <button
                        onClick={() => onSelectReportFromAlert(alt.candidateEmail)}
                        className="text-[9px] font-mono font-bold uppercase py-1 px-3 rounded bg-white border border-slate-200 hover:border-indigo-505 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-500 transition-all shadow-sm cursor-pointer"
                      >
                        Deep Audit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Live Candidate Helpdesk split screen */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            {/* Left Session Explorer */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                  Active Connections ({activeSessions.length})
                </span>
                <button
                  type="button"
                  onClick={loadActiveSessions}
                  className="text-[10px] font-mono hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Sync Active
                </button>
              </div>

              {activeSessions.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 font-mono">Zero candidate workspaces online today.</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    Once a candidate logs in and takes an appraisal, their line lists here immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {activeSessions.map((ses) => {
                    const isSelected = selectedSessionId === ses.id;
                    const isEmergency = ses.supportEmergencyActive;
                    
                    return (
                      <div
                        key={ses.id}
                        onClick={() => {
                          setSelectedSessionId(ses.id);
                          loadSelectedChats(ses.id);
                        }}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-400 shadow-sm"
                            : isEmergency
                            ? "bg-rose-50/40 border-rose-350 border-rose-200 hover:bg-slate-50 shadow-[0_0_12px_rgba(244,63,94,0.08)] animate-pulse"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Red emergency tag top ribbon */}
                        {isEmergency && (
                          <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-rose-500" />
                        )}

                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 text-xs block font-heading font-bold">
                              {ses.candidateName}
                            </strong>
                            <span className="text-[10px] text-slate-500 font-mono tracking-tight block">
                              {ses.candidateEmail}
                            </span>
                          </div>

                          <span className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-extrabold uppercase ${
                            ses.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}>
                            {ses.status.replace("_", " ")}
                          </span>
                        </div>

                        {isEmergency && (
                          <div className="py-0.5 px-2 rounded bg-rose-100 text-rose-800 text-[8px] font-mono font-bold flex items-center gap-1 self-start uppercase max-w-full">
                            🚨 TECHNICAL EMERGENCY REPORTED
                          </div>
                        )}

                        {ses.chats && ses.chats.length > 0 ? (
                          <p className="text-[10px] text-slate-500 truncate border-t border-slate-100 pt-1.5 font-sans italic">
                            Message: "{ses.chats[ses.chats.length - 1].text}"
                          </p>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-1">
                            No active logs compiled.
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Chat Panel */}
            <div className="md:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-4 min-h-[380px] flex flex-col justify-between">
              {selectedSessionId ? (
                <>
                  {/* Header */}
                  <div className="border-b border-slate-200 pb-3 mb-3 flex justify-between items-center bg-slate-100 -mx-4 -mt-4 p-4 rounded-t-2xl">
                    <div>
                      {(() => {
                        const currentSes = activeSessions.find(s => s.id === selectedSessionId);
                        return (
                          <>
                            <h4 className="text-xs font-heading font-extrabold text-slate-800">
                              Support Desk Connection: {currentSes ? currentSes.candidateName : "Session"}
                            </h4>
                            <p className="text-[9px] font-mono text-slate-500 uppercase">
                              Active ID: {selectedSessionId}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    <button
                      type="button"
                      onClick={handleHrToggleEmergency}
                      className={`px-2.5 py-1 rounded text-[9px] font-mono tracking-widest font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                        activeSessionEmergency
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300"
                      }`}
                      title="Direct override/resolution of extreme lockdown emergencies"
                    >
                      {activeSessionEmergency ? "🚨 Emergency Active (Flag Resolved)" : "Emergency Flag"}
                    </button>
                  </div>

                  {/* Bubble transcripts */}
                  <div className="flex-1 h-56 overflow-y-auto mb-3 space-y-2.5 bg-white rounded-xl border border-slate-200 p-3 flex flex-col scrollbar-thin">
                    {sessionChats.length === 0 ? (
                      <div className="my-auto text-center space-y-1 p-4">
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Interactive Stream Connected</p>
                        <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                          Candidate has not started any help tickets. You can type a live instruction advice below at any point!
                        </p>
                      </div>
                    ) : (
                      sessionChats.map((ch: any) => {
                        const isCandidate = ch.sender === "candidate";
                        return (
                          <div
                            key={ch.id}
                            className={`flex flex-col max-w-[85%] ${
                              isCandidate ? "self-start items-start" : "self-end items-end"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[8px] font-mono text-slate-400">
                                {isCandidate ? "Candidate (Live)" : "You (Support)"}
                              </span>
                              <span className="text-[7px] text-slate-300">
                                {new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`p-2.5 py-1.5 rounded-xl text-xs leading-normal ${
                              ch.isTechnicalEmergency
                                ? "bg-rose-100 text-rose-900 border border-rose-200"
                                : isCandidate
                                ? "bg-slate-250 bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50"
                                : "bg-indigo-600 text-white rounded-tr-none"
                            }`}>
                              {ch.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={scrollRef} />
                  </div>

                  {/* Quick HR suggestions */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    <span className="text-[8px] text-slate-400 font-mono tracking-wider items-center flex uppercase mr-1">Direct Help options:</span>
                    {[
                      "We advise you to reload your browser page (your current answers are auto-saved).",
                      "Please adjust camera lighting so our AI biometric align can sync properly.",
                      "Emergency received. Don't worry, we have waived your assessment timer constraint.",
                      "System connection looks fully stable now. Proceed ahead safely."
                    ].map((ansText, ind) => {
                      const labelText = ind === 0 ? "Advise Refresh" : ind === 1 ? "Fix Camera Positioning" : ind === 2 ? "Waive Timer Limit" : "Stable connection now";
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => {
                            setHrResponseText(ansText);
                          }}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:border-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-600 font-medium transition-all text-[9px] cursor-pointer truncate max-w-[280px]"
                        >
                          {labelText}
                        </button>
                      );
                    })}
                  </div>

                  {/* Message Input form */}
                  <form onSubmit={handleHrSendResponse} className="flex gap-2">
                    <input
                      type="text"
                      value={hrResponseText}
                      onChange={(e) => setHrResponseText(e.target.value)}
                      placeholder="Text standard response or direct instructions to candidate..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!hrResponseText.trim()}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 flex items-center gap-1 text-xs cursor-pointer font-bold shrink-0 shadow-sm"
                    >
                      Send <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="my-auto text-center space-y-2 p-4">
                  <p className="font-heading font-medium text-slate-500 text-sm">No Active Ticket Selected</p>
                  <p className="text-xs text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                    Select an online candidate session from the explorer on the left to review their live connection logs, chat back and forth, or resolve lockdown emergencies.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
