/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { 
  PenTool, Square, Circle, Minus, Type, Eraser, 
  Trash2, Download, Undo, Redo, Palette, Sparkles, Check
} from "lucide-react";

interface WhiteboardProps {
  onCanvasExport?: (dataUrl: string) => void;
}

export default function WhiteboardCanvas({ onCanvasExport }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"pen" | "line" | "rect" | "circle" | "eraser">("pen");
  const [color, setColor] = useState("#4f46e5"); // Indigo
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [copiedAlert, setCopiedAlert] = useState(false);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI scale
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Default white fill
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Save initial blank state
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const coords = getCanvasCoords(e);

    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else if (tool === "rect") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
    } else if (tool === "circle") {
      ctx.beginPath();
      const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    // Save history
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), state]);

    if (onCanvasExport) {
      onCanvasExport(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([state]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `architecture_whiteboard_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
  };

  const paletteColors = [
    { hex: "#0f172a", label: "Dark" },
    { hex: "#4f46e5", label: "Indigo" },
    { hex: "#0284c7", label: "Sky" },
    { hex: "#059669", label: "Emerald" },
    { hex: "#e11d48", label: "Rose" },
    { hex: "#d97706", label: "Amber" },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Whiteboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {/* Tool buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              tool === "pen" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Freehand Pencil"
          >
            <PenTool className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              tool === "line" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Straight Line"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              tool === "rect" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Rectangle / Architecture Box"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              tool === "circle" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Circle / Node"
          >
            <Circle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              tool === "eraser" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          {paletteColors.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setColor(c.hex);
                if (tool === "eraser") setTool("pen");
              }}
              className={`h-5 w-5 rounded-full transition-all cursor-pointer ${
                color === c.hex && tool !== "eraser" ? "ring-2 ring-indigo-500 scale-110" : "opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
          <input
            type="range"
            min="1"
            max="12"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 accent-indigo-600 ml-2 cursor-pointer"
            title={`Stroke width: ${lineWidth}px`}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={history.length <= 1}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs cursor-pointer disabled:opacity-40"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs cursor-pointer"
            title="Clear Board"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={downloadCanvas}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
            title="Download PNG Export"
          >
            {copiedAlert ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-white cursor-crosshair overflow-hidden min-h-[380px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Collaborative Canvas • Live Interviewer Mirror Active
        </div>
      </div>
    </div>
  );
}
