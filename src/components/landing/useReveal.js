"use client";

import { useRef, useEffect } from "react";

export default function useReveal(cls = "reveal") {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add(cls);
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) e.target.classList.add("in");
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cls]);
  return ref;
}
