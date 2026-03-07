"use client";

interface SuccessOverlayProps {
  onClose: () => void;
}

export default function SuccessOverlay({ onClose }: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-10 bg-[rgba(9,11,14,0.95)] backdrop-blur-md">
      {/* Pulse ring */}
      <div className="w-20 h-20 rounded-full border-2 border-[#00d4c8] flex items-center justify-center text-[2rem] text-[#00d4c8] mb-6 animate-pulse">
        ✓
      </div>
      <h2 className="font-syne font-extrabold text-[2rem] text-white mb-3">
        Thank you.
      </h2>
      <p className="text-[#6b7280] text-[0.95rem] leading-[1.7] max-w-[400px] mb-8">
        Your feedback just landed in a real inbox, in front of a real person
        who cares. We'll read every word — and if you left an email, there's a
        good chance you'll hear back.
      </p>
      <button
        onClick={onClose}
        className="bg-[#00d4c8] text-[#090b0e] font-syne font-bold text-[0.8rem] uppercase tracking-widest px-7 py-3 hover:opacity-85 transition-opacity duration-200"
      >
        Back to Graphix
      </button>
    </div>
  );
}
