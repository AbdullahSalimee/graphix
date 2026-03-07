import NavBar from "@/components/NavBar";
import FeedbackLeft from "@/components/feedback/FeedbackLeft";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata = {
  title: "Feedback — Graphix",
  description:
    "Your voice shapes what we build next. Share your honest feedback with the Graphix team.",
};

export default function FeedbackPage() {
  return (
    <main className="bg-[#111212] text-white min-h-screen">
      <NavBar />
      <div className="pt-16 grid grid-cols-1 lg:grid-cols-[420px_1fr]">
        <FeedbackLeft />
        <FeedbackForm />
      </div>
    </main>
  );
}
