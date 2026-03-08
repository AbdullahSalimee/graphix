import { useEffect, useState } from "react";

const words = [
  "bar charts",
  "heatmaps",
  "pie charts",
  "scatter plots",
  "dashboards",
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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

  return (
    <div className="text-center px-6">
      <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-5">
        AI Data Visualization
      </p>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-gray-900">
        Describe your data.
        <br />
        <span className="text-gray-300">Get stunning </span>
        <span
          className={`border-b-4 border-gray-900 text-gray-900 transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          }`}
          style={{ display: "inline-block" }}
        >
          {words[index]}
        </span>
        <span className="text-gray-300">.</span>
      </h1>

      <p className="mt-5 text-base text-gray-400 max-w-sm mx-auto leading-relaxed">
        No code. No spreadsheets. Just plain English — your chart appears in
        seconds.
      </p>
    </div>
  );
}
