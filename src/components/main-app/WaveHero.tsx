import { useEffect, useState } from "react";
import ChartTypeSelector from "./Charttypeselector";

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
  onSend: (prompt: string, fileContent: string, fileName: string) => void;
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
    setFileContent("");
    setFileName("");
  };

  const canSend = !!input.trim() && !isLoading;

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
      <div className="w-full max-w-[620px]">
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
              type="file"
              accept=".csv,.json,text/csv,text/plain,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                const text = await file.text();
                setFileContent(text);
              }}
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
          <ChartTypeSelector onSelect={setChartType} />

          <div className="w-px h-5 bg-cyan-500 flex-shrink-0" />

          {/* File pill */}
          {fileName && (
            <div className="flex items-center gap-1 text-cyan-500 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 max-w-[70px] sm:max-w-[90px] flex-shrink-0">
              <span className="truncate">{fileName}</span>
              <button
                onClick={() => {
                  setFileContent("");
                  setFileName("");
                }}
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
              chartType
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

        {/* Suggestion chips — scrollable on mobile */}
        <div className="flex gap-2 mt-3 sm:mt-4 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:justify-center">
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
