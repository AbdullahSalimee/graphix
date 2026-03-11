import { useEffect, useState, useRef, ChangeEvent } from "react";
import ChartTypeSelector from "./Charttypeselector";
import { autoDetectChartHint, csvToPlotly } from "./Csvprocessor";

const words = [
  "bar charts",
  "heatmaps",
  "pie charts",
  "scatter plots",
  "dashboards",
];

interface SelectedChart {
  groupLabel: string;
  subLabel: string;
  prompt: string | null;
}

interface WaveHeroProps {
  onSend: (
    prompt: string,
    fileContent: string,
    fileName: string,
    prebuiltConfig?: any,
  ) => void;
  isLoading: boolean;
}

export default function WaveHero({ onSend, isLoading }: WaveHeroProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [input, setInput] = useState("");
  const [chartType, setChartType] = useState<SelectedChart | null>(null);
  const [focused, setFocused] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [detectedHint, setDetectedHint] = useState<string | null>(null);
  const [userOverride, setUserOverride] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      setFileContent(text);
      setBannerDismissed(false);

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
      // Case 1: User manually picked a chart type → AI handles it
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

      // Case 2: Banner was dismissed via ✕ → send to AI, skip csvToPlotly
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
  const showBanner = (!!detectedHint && !bannerDismissed) || userOverride;

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 sm:px-4 gap-6 sm:gap-8 py-8">
      {/* Logo + Title */}
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <img src="/logo.png" alt="" className="h-10 sm:h-14 animate-pulse" />
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-bold text-white py-1 rounded-lg leading-none">
            Graphix
          </h1>
        </div>
      </div>

      {/* Centered input */}
      <div className="w-full max-w-[620px] flex flex-col gap-2">
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

        <div
          className={`flex items-center gap-1.5 sm:gap-2 bg-white border border-white rounded-xl sm:rounded-2xl px-2.5 sm:px-3 py-2.5 sm:py-3 shadow-sm transition-all duration-150 ${
            focused ? "border-neutral-400 shadow-md" : "border-neutral-200"
          }`}
        >
          {/* Attach */}
          <label
            htmlFor="hero-file-upload"
            className="cursor-pointer flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all flex-shrink-0"
            title="Attach CSV or JSON"
          >
            <input
              id="hero-file-upload"
              ref={fileRef}
              type="file"
              accept=".csv,.json,text/csv,text/plain,application/json"
              onChange={handleFile}
              className="hidden"
            />
            <svg
              width="15"
              height="15"
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
                setUserOverride(true);
                setDetectedHint(null);
                setBannerDismissed(false);
              }
            }}
          />

          <div className="w-px h-5 bg-cyan-500 flex-shrink-0" />

          {/* File pill */}
          {fileName && (
            <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 max-w-[70px] sm:max-w-[90px] flex-shrink-0">
              {detectedHint && !userOverride && !bannerDismissed && (
                <span className="text-cyan-400 text-[9px] font-bold uppercase mr-0.5">
                  {detectedHint}
                </span>
              )}
              <span className="truncate">{fileName}</span>
              <button
                onClick={clearFile}
                className="text-neutral-300 hover:text-neutral-600"
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

          {/* Input */}
          <input
            className="flex-1 border-none outline-none text-neutral-800 text-xs sm:text-sm min-w-0 placeholder:text-neutral-400 bg-transparent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
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
                    : 'e.g. "Monthly sales Q1–Q4 2024"'
            }
            disabled={isLoading}
          />

          {/* Send */}
          <button
            onClick={send}
            disabled={!canSend}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              canSend
                ? "bg-cyan-500 text-white"
                : "bg-cyan-100 text-neutral-300 cursor-default"
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin"
                width="12"
                height="12"
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
                width="12"
                height="12"
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

        {/* Suggestion chips */}
        <div className="flex gap-2 mt-1 sm:mt-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:justify-center">
          {[
            "Monthly revenue Q1–Q4",
            "User growth by region",
            "Sales vs forecast",
            "Top 10 products",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-cyan-500 text-cyan-500 hover:border-cyan-300 hover:text-cyan-700 transition-all whitespace-nowrap flex-shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
