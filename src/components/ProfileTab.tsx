import React, { useState } from "react";
import { User, Mail, Upload, CheckCircle2, FileText, Camera, ShieldCheck, Cpu } from "lucide-react";
import { motion } from "motion/react";

interface ProfileTabProps {
  candidateName: string;
  candidateEmail: string;
  onChangeUser: (name: string, email: string) => void;
  mockRole: string;
}

export default function ProfileTab({ candidateName, candidateEmail, onChangeUser, mockRole }: ProfileTabProps) {
  const [name, setName] = useState(candidateName);
  const [email, setEmail] = useState(candidateEmail);
  const [isSaved, setIsSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeUser(name, email);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Card: Account Card */}
        <div className="md:col-span-1 w-full md:w-1/3 space-y-4">
          <div className="glass-card rounded-2xl p-5 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-505 bg-indigo-600" />
            <div className="h-20 w-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-2xl relative">
              {name ? name.split(" ").map(w => w[0]).join("") : "U"}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Verified System ID Check">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            
            <h3 className="text-base font-heading font-bold text-slate-800 mt-4">{name || "Unnamed Candidate"}</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">{email || "no-email@hire-shield.com"}</p>
            
            <div className="w-full border-t border-slate-100 my-4 pt-4 text-left space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">System Badge</span>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed text-xs text-slate-600">
                <span className="font-semibold text-slate-800 block">Assessment Target:</span>
                {mockRole || "General Tech Candidate"}
              </div>
            </div>
          </div>

          {/* Secure compliance checklist */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Hardware Sandbox Compliance</span>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Camera className="h-4 w-4 text-emerald-500" /> Camera access</span>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">PROCTOR_GREEN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Cpu className="h-4 w-4 text-indigo-500" /> Proctor Sandbox v2.5</span>
                <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">ACTIVE_SHIELD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-sky-500" /> Resume verification</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                  uploadedFile ? "text-emerald-650 bg-emerald-50 border-emerald-100 text-emerald-750" : "text-amber-600 bg-amber-50 border-amber-100"
                }`}>
                  {uploadedFile ? "VERIFIED_NLP" : "NOT_SUBMITTED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Profile Edit Forum */}
        <div className="flex-1 space-y-4">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-base font-heading font-bold text-slate-800">Direct Candidate Registration & Profile File</h2>
              <p className="text-xs text-slate-500">Configure your identification values here. These are bundled as proctor reference standards.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Candidate Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Candidate Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {isSaved && (
                  <span className="text-xs font-mono text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Personal credentials stored securely.
                  </span>
                )}
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
                >
                  Save Identity Profile
                </button>
              </div>
            </form>
          </div>

          {/* CV / Resume upload sandbox */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-850 text-slate-800">Simulate Resume CV Verification Upload</h3>
              <p className="text-xs text-slate-500">Enable Gemini's automated background checks on your technical experience profile.</p>
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative ${
                dragActive ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
              }`}
            >
              <input 
                type="file" 
                id="resume-upload" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden" 
              />
              
              <label htmlFor="resume-upload" className="flex flex-col items-center justify-center cursor-pointer space-y-2">
                <div className="p-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Upload className="h-5 w-5" />
                </div>
                {uploadedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-indigo-700">{uploadedFile}</p>
                    <p className="text-[10px] text-slate-500 text-slate-400">File uploaded and cached locally. Mock CV analysis engaged.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Drag & drop your resume file or <span className="text-indigo-600 underline">browse</span></p>
                    <p className="text-[10px] text-slate-400">Supports PDF, DOC, DOCX up to 5MB total size</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
