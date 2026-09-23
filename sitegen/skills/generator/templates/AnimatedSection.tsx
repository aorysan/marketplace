"use client";
import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "zoom";
  className?: string;
}

export default function AnimatedSection({ children, delay = 0, direction = "up", className = "" }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const getInitialTransform = () => {
      switch (direction) {
        case "left": return { translateX: 30 };
        case "right": return { translateX: -30 };
        case "zoom": return { scale: 0.9 };
        case "up": default: return { translateY: 30 };
      }
    };

    const getFinalTransform = () => {
      switch (direction) {
        case "left": return { translateX: [30, 0] };
        case "right": return { translateX: [-30, 0] };
        case "zoom": return { scale: [0.9, 1] };
        case "up": default: return { translateY: [30, 0] };
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: el,
              opacity: [0, 1],
              ...getFinalTransform(),
              duration: 800,
              delay: delay,
              easing: "easeOutCubic",
            });
          } else if (entry.boundingClientRect.top > 0) {
            // Asymmetric Reset
            anime.set(el, { opacity: 0, ...getInitialTransform() });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (el) anime.remove(el);
    };
  }, [delay, direction]);

  const getInitialStyle = (): React.CSSProperties => {
    switch (direction) {
      case "left": return { opacity: 0, transform: "translateX(30px)" };
      case "right": return { opacity: 0, transform: "translateX(-30px)" };
      case "zoom": return { opacity: 0, transform: "scale(0.9)" };
      case "up": default: return { opacity: 0, transform: "translateY(30px)" };
    }
  };

  return (
    <div ref={ref} style={getInitialStyle()} className={className}>
      {children}
    </div>
  );
}
