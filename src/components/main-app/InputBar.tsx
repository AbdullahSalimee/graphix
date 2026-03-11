// components/InputBar.tsx
"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import ChartTypeSelector from "./Charttypeselector";
import { autoDetectChartHint, csvToPlotly } from "./Csvprocessor";

interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
}

interface InputBarProps {
  onSend: (
    prompt: string,
    fileContent: string,
    fileName: string,
    prebuiltConfig?: any,
  ) => void;
  isLoading: boolean;
}

export default function InputBar({ onSend, isLoading }: InputBarProps) {
  const [input, setInput] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [chartType, setChartType] = useState<SelectedChart | null>(null);
  const [focused, setFocused] = useState(false);
  const [detectedHint, setDetectedHint] = useState<string | null>(null);
  const [userOverride, setUserOverride] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false); // ← tracks ✕ click

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      setFileContent(text);
      setBannerDismissed(false); // reset on every new file

      const hint = autoDetectChartHint(text);
      if (hint !== "auto") {
        setDetectedHint(hint);
        setUserOverride(false);
        setChartType({
          groupLabel: hint.charAt(0).toUpperCase() + hint.slice(1),
          subLabel: "AI Choice",
          prompt: null,
        });
      } else {
        setDetectedHint(null);
        setUserOverride(false);
      }
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  const clearFile = () => {
    setFileContent("");
    setFileName("");
    setDetectedHint(null);
    setUserOverride(false);
    setBannerDismissed(false);
    setChartType(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = () => {
    if (!input.trim() || isLoading) return;

    if (fileContent) {
      // Case 1: User manually picked a chart type from selector → AI handles it
      if (userOverride) {
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
        return;
      }

      // Case 2: User clicked ✕ on banner → send to AI, skip csvToPlotly entirely
      if (bannerDismissed) {
        let finalPrompt = input.trim();
        if (chartType?.prompt) {
          finalPrompt += ` — make this as a "${chartType.prompt}"`;
        }
        onSend(finalPrompt, fileContent, fileName);
        setInput("");
        clearFile();
        return;
      }

      // Case 3: Auto-detection banner still active → build directly without AI
      const autoHint = autoDetectChartHint(fileContent);
      if (autoHint !== "auto") {
        const config = csvToPlotly(fileContent, autoHint, input.trim());
        onSend(input.trim(), fileContent, fileName, config);
        setInput("");
        clearFile();
        return;
      }

      // Case 4: Detection returned "auto" → send to AI normally
      let finalPrompt = input.trim();
      if (chartType?.prompt) {
        finalPrompt += ` — make this as a "${chartType.prompt}"`;
      }
      onSend(finalPrompt, fileContent, fileName);
      setInput("");
      clearFile();
      return;
    }

    // No file — normal AI path
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

  // Banner shows only when detection is active (not dismissed) OR user has overridden
  const showBanner = (!!detectedHint && !bannerDismissed) || userOverride;

  return (
    <div
      className="sticky bottom-0 z-10 bg-neutral-50/95 backdrop-blur-xl border-t border-neutral-200 px-2 sm:px-3 md:px-5 pt-2 pb-2"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-[820px] mx-auto flex flex-col gap-1 my-1.5 sm:my-3">
        {/* Detection / override banner */}
        {showBanner && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
              userOverride
                ? "bg-violet-50 border-violet-200 text-violet-700"
                : "bg-cyan-50 border-cyan-200 text-cyan-700"
            }`}
          >
            <span
              className={userOverride ? "text-violet-400" : "text-cyan-400"}
            >
              ✦
            </span>
            <span>
              {userOverride ? (
                <>
                  Using{" "}
                  <strong>
                    {chartType?.subLabel === "AI Choice"
                      ? chartType?.groupLabel
                      : chartType?.subLabel}
                  </strong>{" "}
                  chart — your selection overrides auto-detection
                </>
              ) : (
                <>
                  Detected <strong>{detectedHint}</strong> chart — will render
                  directly without AI
                </>
              )}
            </span>
            <button
              onClick={() => {
                // ✕ clicked: hide banner and remember it was dismissed
                // send() will see bannerDismissed=true and route to AI
                setDetectedHint(null);
                setUserOverride(false);
                setBannerDismissed(true);
                setChartType(null);
              }}
              className={`ml-auto ${userOverride ? "text-violet-400 hover:text-violet-600" : "text-cyan-400 hover:text-cyan-600"}`}
            >
              ✕
            </button>
          </div>
        )}

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
          <ChartTypeSelector
            onSelect={(ct) => {
              setChartType(ct);
              if (fileContent) {
                // Selecting a chart type while file is loaded = user override
                setUserOverride(true);
                setDetectedHint(null);
                setBannerDismissed(false);
              }
            }}
          />

          {/* Divider */}
          <div className="w-px h-4 bg-neutral-100 flex-shrink-0" />

          {/* Inline file pill */}
          {fileName && (
            <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 max-w-[70px] sm:max-w-[96px] flex-shrink-0">
              {detectedHint && !userOverride && !bannerDismissed && (
                <span className="text-cyan-400 text-[9px] font-bold uppercase mr-0.5">
                  {detectedHint}
                </span>
              )}
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
              userOverride && chartType
                ? `Title for your ${chartType.subLabel === "AI Choice" ? chartType.groupLabel : chartType.subLabel} chart…`
                : detectedHint && !bannerDismissed
                  ? `Title for your ${detectedHint} chart…`
                  : chartType
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
