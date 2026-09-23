"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SwipeableCards.module.css";

interface SwipeableCardsProps {
  children: React.ReactNode;
  /** Kelas grid desktop dari halaman pemanggil — agar layout desktop tidak hancur. */
  className?: string;
  label: string;
}

export default function SwipeableCards({ children, className = "", label }: SwipeableCardsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const count = React.Children.count(children);
  const [active, setActive] = useState(0);

  const updateActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (cards.length === 0) return;
    let best = 0;
    let bestDist = Infinity;
    const center = track.scrollLeft + track.clientWidth / 2;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.clientWidth / 2 - center);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    updateActive();
  }, [updateActive]);

  const scrollTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const target = cards[Math.max(0, Math.min(index, cards.length - 1))];
    if (target) track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") scrollTo(active + 1);
    if (e.key === "ArrowLeft") scrollTo(active - 1);
  };

  return (
    <div className={styles.wrapper}>
      <div
        ref={trackRef}
        className={`${styles.track} ${className}`}
        tabIndex={0}
        role="region"
        aria-label={label}
        aria-roledescription="carousel"
        onScroll={updateActive}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className={i === active ? `${styles.dot} ${styles.dotActive}` : styles.dot} />
        ))}
      </div>
    </div>
  );
}
