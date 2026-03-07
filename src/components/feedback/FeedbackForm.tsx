"use client";

import { useState } from "react";
import EmojiRating from "./EmojiRating";
import CategoryChips from "./CategoryChips";
import SuccessOverlay from "./SuccessOverlay";

const roles = [
  "Individual / personal projects",
  "Startup founder or operator",
  "Product manager or analyst",
  "Data scientist or engineer",
  "Marketing or growth team",
  "Student or researcher",
  "Enterprise / large team",
  "Just exploring",
];

const fieldCls =
  "bg-[#131619] border border-[#1e2227] text-white font-light text-[0.95rem] px-4 py-3.5 outline-none transition-all duration-200 focus:border-[#00d4c8] focus:shadow-[0_0_0_2px_rgba(0,212,200,0.12)] w-full placeholder-[#6b7280] resize-none";

export default function FeedbackForm() {
  const [rating, setRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [mainText, setMainText] = useState("");
  const [featureText, setFeatureText] = useState("");
  const [publicPerm, setPublicPerm] = useState(false);
  const [mainError, setMainError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainText.trim()) {
      setMainError(true);
      document.getElementById("fmain")?.focus();
      setTimeout(() => setMainError(false), 1800);
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      {submitted && <SuccessOverlay onClose={() => setSubmitted(false)} />}

      <section
        className="px-14 py-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.034) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.034) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-syne font-extrabold text-[clamp(1.6rem,2.5vw,2.4rem)] tracking-tight text-white leading-tight mb-3">
            Tell us everything.
            <br />
            We mean it.
          </h2>
          <p className="text-[#6b7280] text-[0.95rem] leading-[1.75] max-w-[480px]">
            No question is too small, no complaint too niche. The more specific
            you are, the more useful you become — and we mean that as the
            highest compliment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Emoji rating */}
          <EmojiRating value={rating} onChange={setRating} />

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.76rem] uppercase tracking-[0.08em] text-[#6b7280]">
                Your Name <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                className={fieldCls}
                type="text"
                placeholder="e.g. Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.76rem] uppercase tracking-[0.08em] text-[#6b7280]">
                Email <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                className={fieldCls}
                type="email"
                placeholder="we'll reply if we have follow-ups"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2 mb-7">
            <label className="text-[0.76rem] uppercase tracking-[0.08em] text-[#6b7280]">
              How do you use Graphix?
            </label>
            <select
              className={`${fieldCls} appearance-none`}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>Select your role...</option>
              {roles.map((r) => (
                <option key={r} value={r} className="bg-[#131619]">{r}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <CategoryChips selected={categories} onChange={setCategories} />

          {/* Main feedback */}
          <div className="flex flex-col gap-2 mb-1">
            <label className="text-[0.76rem] uppercase tracking-[0.08em] text-[#6b7280]">
              What's on your mind?
            </label>
            <textarea
              id="fmain"
              className={`${fieldCls} ${mainError ? "border-red-500" : ""}`}
              rows={6}
              maxLength={1200}
              placeholder="Be as specific as you'd like. What worked? What didn't? What made you pause? What made you smile? If you ran into a bug, describe exactly what happened. If something delighted you — tell us, we need to know what to protect."
              value={mainText}
              onChange={(e) => setMainText(e.target.value)}
            />
          </div>
          <div className="text-right text-[0.7rem] text-[#6b7280] mb-5">
            {mainText.length} / 1200
          </div>

          {/* Feature request */}
          <div className="flex flex-col gap-2 mb-1">
            <label className="text-[0.76rem] uppercase tracking-[0.08em] text-[#6b7280]">
              Is there something you wish Graphix could do that it currently can't?
            </label>
            <textarea
              className={fieldCls}
              rows={3}
              maxLength={600}
              placeholder="Dream out loud. Even 'impossible' ideas have shipped before."
              value={featureText}
              onChange={(e) => setFeatureText(e.target.value)}
            />
          </div>
          <div className="text-right text-[0.7rem] text-[#6b7280] mb-7">
            {featureText.length} / 600
          </div>

          {/* Permission toggle */}
          <button
            type="button"
            onClick={() => setPublicPerm((p) => !p)}
            className="flex gap-4 items-start border border-[#1e2227] bg-[#131619] p-5 mb-8 text-left hover:border-[#00d4c8] transition-all duration-200 w-full"
          >
            <div
              className={`w-5 h-5 border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                publicPerm
                  ? "bg-[#00d4c8] border-[#00d4c8]"
                  : "border-[#1e2227]"
              }`}
            >
              {publicPerm && (
                <span className="text-[#090b0e] text-[0.72rem] font-bold">✓</span>
              )}
            </div>
            <p className="text-[0.84rem] text-[#6b7280] leading-[1.65]">
              <strong className="text-white font-medium">
                You can share my feedback publicly
              </strong>{" "}
              — as an anonymised testimonial on the Graphix website or in
              product communications. We will never attribute it to you without
              asking first.
            </p>
          </button>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button
              type="submit"
              className="bg-[#00d4c8] text-[#090b0e] font-syne font-bold text-[0.82rem] uppercase tracking-widest px-10 py-4 hover:opacity-85 transition-opacity duration-200 flex-shrink-0"
            >
              Send My Feedback →
            </button>
            <p className="text-[#6b7280] text-[0.8rem] leading-[1.6]">
              Takes about 3 minutes. No account required. No spam, ever. Just a
              small team that genuinely wants to hear from you.
            </p>
          </div>
        </form>
      </section>
    </>
  );
}
