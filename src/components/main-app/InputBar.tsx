// components/InputBar.tsx
"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import ChartTypeSelector from "./Charttypeselector";

interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
}

interface InputBarProps {
  onSend: (prompt: string, fileContent: string, fileName: string) => void;
  isLoading: boolean;
}

export default function InputBar({ onSend, isLoading }: InputBarProps) {
  const [input, setInput] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [chartType, setChartType] = useState<SelectedChart | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const text = await file.text();
      setFileContent(text);
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  const clearFile = () => {
    setFileContent("");
    setFileName("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const send = () => {
    if (!input.trim() || isLoading) return;

    // Build final prompt with chart type instruction
    let finalPrompt = input.trim();

    if (chartType) {
      if (chartType.prompt) {
        // Specific subtype selected
        finalPrompt += ` — make this as a "${chartType.prompt}"`;
      } else {
        // AI should choose best subtype in this category
        finalPrompt += ` — make this as a ${chartType.groupLabel} chart (choose the best subtype)`;
      }
    }

    onSend(finalPrompt, fileContent, fileName);

    // Reset input & file
    setInput("");
    clearFile();

    // Chart type remains selected (good UX for repeated charts of same type)
  };

  return (
    <div className="input-area sticky bottom-0 z-10 px-3 md:px-6 pb-[env(safe-area-inset-bottom,0.75rem)] pt-2.5 bg-[#070d1a]/85 backdrop-blur-xl border-t border-white/4">
      <div className="input-wrap max-w-[820px] mx-auto flex flex-col gap-1.5">
        {/* Selected file pill */}
        {fileName && (
          <div className="file-pill inline-flex items-center gap-2 text-sky-400 text-xs bg-sky-500/8 border border-sky-500/20 rounded-full px-3 py-1 max-w-full overflow-hidden">
            <span>📎</span>
            <span className="truncate">{fileName}</span>
            <button
              onClick={clearFile}
              className="file-remove text-slate-400 hover:text-slate-200 transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main input row */}
        <div className="input-box flex items-center gap-2 bg-[#0c1628]/90 border border-sky-500/10 rounded-xl px-3 md:px-4 py-2.5 transition-all focus-within:border-sky-500/30">
          {/* File attach button */}
          <label
            htmlFor="file-upload"
            className="attach-btn cursor-pointer text-slate-600 hover:text-sky-400 transition-colors flex items-center justify-center min-w-9 min-h-9 rounded-lg"
            title="Attach CSV or JSON file"
          >
            <input
              id="file-upload"
              ref={fileRef}
              type="file"
              accept=".csv,.json,text/csv,text/plain,application/json"
              onChange={handleFile}
              className="hidden"
            />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </label>

          {/* Chart type selector */}
          <ChartTypeSelector onSelect={setChartType} />

          {/* Vertical divider */}
          <div className="w-px h-5 bg-white/6 flex-shrink-0 mx-1" />

          {/* Text input */}
          <input
            className="text-input flex-1 bg-transparent border-none outline-none text-slate-200 text-base md:text-[0.875rem] placeholder:text-slate-700 min-w-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              chartType
                ? `Describe your ${
                    chartType.subLabel === "AI Choice"
                      ? chartType.groupLabel
                      : chartType.subLabel
                  } chart…`
                : 'Describe a chart… e.g. "Monthly sales for 2024"'
            }
            disabled={isLoading}
          />

          {/* Send button */}
          <button
            className={`
              send-btn w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
              ${
                input.trim() && !isLoading
                  ? "bg-gradient-to-br from-sky-700 to-cyan-600 border-transparent text-white cursor-pointer hover:opacity-90 active:scale-95"
                  : "bg-white/3 border border-white/5 text-slate-700 cursor-default"
              }
            `}
            onClick={send}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>

        {/* Hint text */}
        <p className="input-hint text-center text-xs text-slate-700 tracking-wide mt-1">
          Powered by Groq · llama-3.3-70b · Auto key rotation
        </p>
      </div>
    </div>
  );
}
