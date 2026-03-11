// components/AnimatedBackground.tsx
"use client";

export default function AnimatedBackground() {
  return (
    <>
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(-25%);
          }
          100% {
            transform: translateX(25%);
          }
        }

        .bg-layer {
          animation: slide 3s ease-in-out infinite alternate;
          background-image: linear-gradient(-60deg, black, black 50%);
          position: fixed;
          inset: 0;
          left: -50%;
          right: -50%;
          z-index: -2;
          pointer-events: none;
        }

        /* light neutral layer */
        .bg-layer:nth-child(2) {
          animation-direction: alternate-reverse;
          animation-duration: 4.2s;
          background-image: linear-gradient(
            -60deg,
            black 50%,
            /* gray-100 */ rgba(229, 231, 235, 0.7) 50% /* gray-200 */
          );
        }

        /* deeper neutral layer */
        .bg-layer:nth-child(3) {
          animation-duration: 5.5s;
          background-image: linear-gradient(
            -60deg,
            black 20%,
            /* gray-200 */ rgba(209, 213, 219, 0.5) 50% /* gray-300 */
          );
        }

        /* soft depth overlay */
        .bg-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(
            circle at 30% 70%,
            rgba(0, 0, 0, 0.05) 0%,
            transparent 60%
          );
          z-index: -1;
          pointer-events: none;
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
          min-height: 100vh;
        }
      `}</style>

      <div className="bg-layer" />
      <div className="bg-layer" />
      <div className="bg-layer" />
      <div className="bg-overlay" />
    </>
  );
}
