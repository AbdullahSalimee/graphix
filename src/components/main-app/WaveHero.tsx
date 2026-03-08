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
    <div className="flex flex-col items-center justify-center h-full  px-4 gap-8">
      {/* Logo + Title — Grok style */}
      <div className="flex flex-col items-center gap-4">
       <img src="/logo.png" alt=""  className="h-14 animate-pulse"/>

        <div className="text-center">
          <h1 className="text-2xl md:text-7xl  tracking-tighter font-bold text-white   py-1 rounded-lg leading-none">
            Graphix
          </h1>
         
        </div>
      </div>

      {/* Centered input — Grok style */}
      <div className="w-full max-w-[620px]">
        <div
          className={`flex items-center gap-2 bg-white border rounded-2xl px-3 py-3 shadow-sm transition-all duration-150 ${
            focused ? "border-neutral-400 shadow-md" : "border-neutral-200"
          }`}
        >
          {/* Attach */}
          <label
            htmlFor="hero-file-upload"
            className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all flex-shrink-0"
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

          <div className="w-px h-5 bg-neutral-100 flex-shrink-0" />

          {/* File pill */}
          {fileName && (
            <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 max-w-[90px] flex-shrink-0">
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
            className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm min-w-0 placeholder:text-neutral-400"
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
                ? `Describe your ${chartType.subLabel === "AI Choice" ? chartType.groupLabel : chartType.subLabel} chart…`
                : 'e.g. "Monthly sales for Q1–Q4 2024"'
            }
            disabled={isLoading}
          />

          {/* Send */}
          <button
            onClick={send}
            disabled={!canSend}
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              canSend
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-300 cursor-default"
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
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {[
            "Monthly revenue Q1–Q4",
            "User growth by region",
            "Sales vs forecast",
            "Top 10 products",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
