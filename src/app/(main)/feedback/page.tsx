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
    <main className="text-white min-h-screen">
        {/* <FeedbackForm /> */}
        <FeedbackForm2 />
    </main>
  );
}
