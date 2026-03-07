"use client";

const CATEGORIES = [
  "Chart quality",
  "Natural language understanding",
  "CSV / data import",
  "Speed & performance",
  "UI & design",
  "Onboarding",
  "Export & sharing",
  "Pricing",
  "Something else",
];

interface CategoryChipsProps {
  selected: string[];
  onChange: (cats: string[]) => void;
}

export default function CategoryChips({ selected, onChange }: CategoryChipsProps) {
  const toggle = (cat: string) => {
    onChange(
      selected.includes(cat) ? selected.filter((c) => c !== cat) : [...selected, cat]
    );
  };

  return (
    <div className="mb-7">
      <p className="text-[0.78rem] uppercase tracking-[0.08em] text-[#6b7280] mb-3">
        What area does your feedback touch?{" "}
        <span className="normal-case tracking-normal">(pick all that apply)</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            className={`px-4 py-2 border text-[0.76rem] tracking-[0.05em] font-normal transition-all duration-200 ${
              selected.includes(cat)
                ? "border-[#00d4c8] bg-[rgba(0,212,200,0.1)] text-[#00d4c8]"
                : "border-[#1e2227] bg-[#131619] text-[#6b7280] hover:border-[#00d4c8] hover:text-[#00d4c8]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
