import NavBar from "@/components/NavBar";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackForm2 from "@/components/feedback/FeedbackForm2";

export const metadata = {
  title: "Feedback — Graphix",
  description:
    "Your voice shapes what we build next. Share your honest feedback with the Graphix team.",
};

export default function FeedbackPage() {
  return (
    <main className="bg-[#111212] text-white min-h-screen">
      <NavBar />
      <div className="pt-16 grid grid-cols-1">
        {/* <FeedbackForm /> */}
        <FeedbackForm2 />
      </div>
    </main>
  );
}
