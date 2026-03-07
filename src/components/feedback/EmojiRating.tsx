"use client";

import { useState } from "react";

const options = [
  { val: 1, emoji: "😤", label: "Frustrated" },
  { val: 2, emoji: "😕", label: "Meh" },
  { val: 3, emoji: "😐", label: "Okay" },
  { val: 4, emoji: "😊", label: "Good" },
  { val: 5, emoji: "🤩", label: "Love it" },
];

interface EmojiRatingProps {
  value: number | null;
  onChange: (val: number) => void;
}

export default function EmojiRating({ value, onChange }: EmojiRatingProps) {
  return (
    <div className="mb-11">
      <p className="text-[0.78rem] uppercase tracking-[0.08em] text-[#6b7280] mb-4">
        How has your experience been overall?
      </p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.val}
            type="button"
            onClick={() => onChange(o.val)}
            className={`flex-1 py-3.5 border flex flex-col items-center gap-1.5 text-[1.55rem] transition-all duration-200 ${
              value === o.val
                ? "border-[#00d4c8] bg-[rgba(0,212,200,0.1)]"
                : "border-[#1e2227] bg-[#131619] hover:border-[#00d4c8] hover:bg-[rgba(0,212,200,0.06)]"
            }`}
          >
            <span>{o.emoji}</span>
            <span
              className={`text-[0.66rem] uppercase tracking-[0.05em] ${
                value === o.val ? "text-[#00d4c8]" : "text-[#6b7280]"
              }`}
            >
              {o.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
