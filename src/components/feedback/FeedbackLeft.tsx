import SectionTag from "@/components/ui/SectionTag";

const reasons = [
  {
    num: "01",
    title: "We read every single one",
    desc: "Not a bot. Not a digest summary. Every word you write lands in front of a real human on our product team.",
  },
  {
    num: "02",
    title: "Your frustration becomes our roadmap",
    desc: "The features you see in Graphix today exist because someone just like you was honest about what wasn't working.",
  },
  {
    num: "03",
    title: "We reply — often",
    desc: "If your feedback is specific and you leave an email, there's a good chance you'll hear back personally within 48 hours.",
  },
  {
    num: "04",
    title: "You're not alone in feeling this",
    desc: "When you share a pain point, you often speak for dozens of others who felt the same but didn't say anything.",
  },
];

export default function FeedbackLeft() {
  return (
    <aside className="border-r border-[#1e2227] px-12 py-20 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
      <SectionTag label="Feedback" />

      <h1 className="font-syne font-extrabold text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.0] tracking-tight text-white mb-7">
        Your voice
        <br />
        shapes <span className="text-[#00d4c8]">what</span>
        <br />
        we build next.
      </h1>

      <p className="text-[#6b7280] text-[0.95rem] leading-[1.85] mb-12">
        We're not asking out of habit.{" "}
        <strong className="text-white font-medium">
          Every response we receive changes something
        </strong>{" "}
        — a priority queue, a design decision, a feature we almost cut. You're
        not filling out a form. You're co-authoring this product with us.
        <br />
        <br />
        Be honest. Be blunt. Tell us what delights you and what makes you want
        to close the tab. We can handle it, and{" "}
        <strong className="text-white font-medium">
          we genuinely need to hear it.
        </strong>
      </p>

      {/* Why list */}
      <div className="border border-[#1e2227] flex flex-col mb-9">
        {reasons.map((r, i) => (
          <div
            key={r.num}
            className={`flex gap-4 p-5 hover:bg-[rgba(0,212,200,0.04)] transition-colors duration-200 ${
              i < reasons.length - 1 ? "border-b border-[#1e2227]" : ""
            }`}
          >
            <span className="font-syne font-extrabold text-[1.4rem] text-[#00d4c8] opacity-50 leading-none flex-shrink-0">
              {r.num}
            </span>
            <div>
              <p className="font-syne font-bold text-[0.88rem] text-white mb-1">
                {r.title}
              </p>
              <p className="text-[#6b7280] text-[0.8rem] leading-[1.6]">
                {r.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mini testimonial */}
      <div className="border border-[#1e2227] bg-[#131619] p-5 relative">
        <span className="absolute top-3 left-4 font-syne text-[3rem] text-[#00d4c8] opacity-15 leading-none">
          "
        </span>
        <p className="text-[#6b7280] text-[0.84rem] leading-[1.7] italic pt-3">
          I left a comment about the export flow being confusing. Three weeks
          later it was completely redesigned. That's never happened with any
          other tool I've used.
        </p>
        <p className="mt-3 text-[0.76rem] text-[#00d4c8] font-syne font-semibold">
          — Arya S., Growth Lead at a Series B startup
        </p>
      </div>
    </aside>
  );
}
