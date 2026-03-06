// app/feedback/page.tsx
"use client";

import { useState } from "react";
import {
  PageWrapper,
  Section,
  GlassCard,
  GradientText,
} from "@/components/ui/sharedUI";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here: Integrate with your backend/API (e.g., Formspree, Supabase, or email service)
    // For demo: Just simulate success
    console.log("Feedback submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", rating: "", message: "" });
  };

  return (
    <PageWrapper overlaySize="40px">
      <Section
        title={
          <GradientText className="text-5xl md:text-6xl">
            Share Your Thoughts
          </GradientText>
        }
        description="Your voice shapes Graphify AI. We cherish your honest feelings — what delights you, what could improve, and how we can make it even better for your data adventures. Open up; we're listening with open hearts."
        className="py-32"
      >
        <div className="grid md:grid-cols-2 gap-12">
          {/* Feedback Form */}
          <GlassCard className="p-10">
            <h3 className="text-3xl font-semibold mb-6 text-cyan-400">
              Tell Us How You Feel
            </h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Whether it's a feature that changed your workflow, a bug that
              frustrated you, or an idea that could take us to the next level —
              share openly. Your story helps us grow and serve you better. ❤️
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-slate-800/60 px-4 py-3 text-white border-slate-700/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-slate-800/60 px-4 py-3 text-white border-slate-700/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Rating
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full rounded-lg border bg-slate-800/60 px-4 py-3 text-white border-slate-700/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                >
                  <option value="">Select...</option>
                  <option value="5">5 Stars - Amazing!</option>
                  <option value="4">4 Stars - Great</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Needs Work</option>
                  <option value="1">1 Star - Not Satisfied</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-lg border bg-slate-800/60 px-4 py-3 text-white border-slate-700/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  placeholder="Share your experiences, suggestions, or any improvements you'd love to see..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold shadow-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Send Feedback →
              </button>
              {submitted && (
                <p className="text-cyan-400 mt-4">
                  Thank you for sharing! We'll review it soon. ❤️
                </p>
              )}
            </form>
          </GlassCard>

          {/* Inspirational Testimonials (to encourage sharing) */}
          <div className="space-y-8">
            <h3 className="text-3xl font-semibold text-white">
              What Others Have Shared
            </h3>
            <p className="text-slate-300 mb-6">
              Hearing from users like you inspires us. Here's a glimpse of
              heartfelt stories that helped us improve.
            </p>
            {[
              {
                name: "Ayesha R.",
                text: "The AI suggestions transformed my reports — but adding export to PDF would be a game-changer!",
              },
              {
                name: "Omar K.",
                text: "Love the speed, though handling non-English CSVs could be better. Keep up the great work!",
              },
              {
                name: "Sara M.",
                text: "It feels empowering! Suggestion: More tutorial pop-ups for first-timers like me.",
              },
            ].map((t, i) => (
              <GlassCard key={i} className="p-6">
                <p className="text-slate-200 leading-relaxed mb-4">
                  "{t.text}"
                </p>
                <p className="text-cyan-400 font-semibold">- {t.name}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>
    </PageWrapper>
  );
}
