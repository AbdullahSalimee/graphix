// app/about/page.tsx
import Link from "next/link";
import {
  PageWrapper,
  Section,
  GlassCard,
  GradientText,
} from "@/components/ui/sharedUI";

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <Section
        title={
          <GradientText className="text-5xl md:text-6xl">
            Graphify AI
          </GradientText>
        }
        description="Empowering everyone to unlock insights from data effortlessly. We transform raw CSV files into stunning, interactive graphs and AI-driven analyses — no coding required."
        className="py-32"
      >
        <div className="text-center">
          <Link
            href="/app"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 font-semibold shadow-lg hover:from-indigo-500 hover:to-cyan-500 hover:shadow-xl transition-all text-lg"
          >
            Get Started Free →
          </Link>
        </div>
      </Section>

      {/* Mission Section */}
      <Section
        title="Our Mission"
        description="In a data-driven world, we believe access to insights shouldn't be limited to experts. Our mission is to democratize data analysis, making it simple, fast, and reliable for businesses, students, and creators everywhere."
        centered={true}
        className="bg-slate-900/20 py-24"
      >
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold text-cyan-400">
              Addressing Your Pain Points
            </h3>
            <p className="text-lg text-slate-300 leading-relaxed">
              We know the struggles: sifting through endless rows in
              spreadsheets, wrestling with complex tools like Excel or Python,
              and spending hours on manual charting — only to end up with
              confusing visuals or missed insights.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              Graphify AI solves this 100% by letting you upload any CSV, ask
              questions in plain English (e.g., "Show sales trends by region"),
              and get AI-curated graphs, summaries, and predictions instantly.
              No skills needed, no errors, just reliable results.
            </p>
          </div>

          <GlassCard className="p-10 space-y-8">
            <h3 className="text-3xl font-semibold text-indigo-400">
              Our Intentions for Reliability
            </h3>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-cyan-500">✓</span>
                <span>
                  Built on robust AI models trained on diverse datasets for
                  accurate, unbiased insights.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500">✓</span>
                <span>
                  Privacy-first: Your data is processed in-browser or on secure
                  servers — never stored without consent.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500">✓</span>
                <span>
                  Continuous improvements: We iterate based on user feedback to
                  ensure 99.9% uptime and evolving features.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-500">✓</span>
                <span>
                  Transparent AI: Every suggestion includes explanations, so you
                  trust the process.
                </span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </Section>

      {/* Features / How We Help Section */}
      <Section
        title="How We Make Data Work for You"
        description="From frustration to clarity: We address every pain point in data analysis."
        centered={false}
      >
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "😩 → ✨",
              title: "No More Manual Drudgery",
              desc: "Forget hours in spreadsheets. Upload CSV, type your question, get visuals — done in seconds.",
            },
            {
              icon: "🛡️",
              title: "Reliable & Secure",
              desc: "AI handles edge cases like missing data or outliers. Data encrypted end-to-end.",
            },
            {
              icon: "📈",
              title: "Actionable Insights",
              desc: "Not just graphs: Get forecasts, anomalies, and recommendations to drive decisions.",
            },
            {
              icon: "👥",
              title: "For Everyone",
              desc: "Beginners to pros: Intuitive for new users, powerful for advanced queries.",
            },
            {
              icon: "⚡",
              title: "Speed & Scalability",
              desc: "Handles large CSVs (up to 1M rows) without lag, on any device.",
            },
            {
              icon: "🔄",
              title: "Iterate Effortlessly",
              desc: "Refine queries on-the-fly; AI learns from your interactions for better results.",
            },
          ].map((item, i) => (
            <GlassCard key={i} className="p-6 text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
              <p className="text-slate-400">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Team Section */}
      <Section
        title="Meet Our Team"
        description="A passionate group of data enthusiasts, AI experts, and designers committed to making your data journey seamless."
        className="py-24"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Dr. Elena Vasquez",
              role: "Founder & AI Lead",
              desc: "PhD in Machine Learning, 10+ years building data tools at Google. Passionate about ethical AI.",
              avatar: "EV",
            },
            {
              name: "Marcus Lee",
              role: "CTO & Data Engineer",
              desc: "Expert in scalable systems; previously at AWS. Ensures Graphify is fast and reliable.",
              avatar: "ML",
            },
            {
              name: "Sophia Chen",
              role: "Head of Design",
              desc: "UI/UX specialist with a focus on intuitive interfaces. Makes complex data feel simple.",
              avatar: "SC",
            },
            {
              name: "Raj Patel",
              role: "Product Manager",
              desc: "User advocate with startup experience. Drives features based on real pain points.",
              avatar: "RP",
            },
            {
              name: "Aisha Khan",
              role: "Growth & Community",
              desc: "Builds connections; listens to users to shape our roadmap.",
              avatar: "AK",
            },
            {
              name: "Tom Rivera",
              role: "Security Specialist",
              desc: "Ensures your data's safety with top-tier encryption and compliance.",
              avatar: "TR",
            },
          ].map((member, i) => (
            <GlassCard key={i} className="p-6 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-2xl font-bold shadow-lg mb-4">
                {member.avatar}
              </div>
              <h4 className="text-xl font-semibold">{member.name}</h4>
              <p className="text-cyan-400 mb-2">{member.role}</p>
              <p className="text-slate-400">{member.desc}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section
        title="Join the Data Revolution"
        description="Experience reliable, pain-free analysis today."
        className="py-32 bg-slate-900/30"
      >
        <div className="text-center">
          <Link
            href="/app"
            className="inline-flex items-center px-10 py-5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 font-bold text-xl shadow-xl hover:from-cyan-500 hover:to-indigo-500 transition-all"
          >
            Upload Your First CSV →
          </Link>
        </div>
      </Section>
    </PageWrapper>
  );
}
