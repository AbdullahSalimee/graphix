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
  const [focused, setFocused] = useState(false);

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
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = () => {
    if (!input.trim() || isLoading) return;
    let finalPrompt = input.trim();
    if (chartType) {
      if (chartType.prompt) {
        finalPrompt += ` — make this as a "${chartType.prompt}"`;
      } else {
        finalPrompt += ` — make this as a ${chartType.groupLabel} chart (choose the best subtype)`;
      }
    }
    onSend(finalPrompt, fileContent, fileName);
    setInput("");
    clearFile();
  };

  const canSend = !!input.trim() && !isLoading;

  return (
    <div
      className="sticky bottom-0 z-10 bg-neutral-50/95 backdrop-blur-xl border-t border-neutral-200 px-2 sm:px-3 md:px-5 pt-2 pb-2"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-[820px] mx-auto flex flex-col gap-1 my-1.5 sm:my-3">
        {/* ── Input row ── */}
        <div
          className={`flex items-center gap-1 sm:gap-1.5 bg-white border rounded-lg sm:rounded-xl px-2 py-1.5 shadow-sm transition-all duration-150 ${
            focused ? "ib-focused border-neutral-400" : "border-neutral-200"
          }`}
        >
          {/* Attach */}
          <label
            htmlFor="file-upload"
            className="ib-attach cursor-pointer flex items-center justify-center w-7 h-7 sm:w-7 sm:h-7 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-150 flex-shrink-0"
            title="Attach CSV or JSON"
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
              width="14"
              height="14"
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

          {/* Divider */}
          <div className="w-px h-4 bg-neutral-100 flex-shrink-0" />

          {/* Inline file pill */}
          {fileName && (
            <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 max-w-[70px] sm:max-w-[96px] flex-shrink-0">
              <span className="truncate">{fileName}</span>
              <button
                onClick={clearFile}
                className="text-neutral-300 hover:text-neutral-600 transition-colors flex-shrink-0"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Text input */}
          <input
            className="ib-input flex-1 bg-transparent border-none outline-none text-neutral-800 text-[13px] tracking-tight min-w-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              chartType
                ? `${chartType.subLabel === "AI Choice" ? chartType.groupLabel : chartType.subLabel}…`
                : 'e.g. "Monthly sales Q1–Q4"'
            }
            disabled={isLoading}
          />

          {/* Send */}
          <button
            onClick={send}
            disabled={!canSend}
            className={`ib-send-on w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
              canSend
                ? "bg-neutral-900 text-white cursor-pointer"
                : "bg-neutral-100 text-neutral-300 cursor-default"
            }`}
          >
            {isLoading ? (
              <svg
                className="ib-spinner animate-spin"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                width="11"
                height="11"
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
      </div>
    </div>
  );
}
