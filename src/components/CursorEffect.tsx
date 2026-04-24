"use client";

import { useEffect, useRef } from "react";

export default function CursorEffect() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const visible = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if (typeof window === "undefined" || "ontouchstart" in window) return;

    const handleMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        if (glowRef.current) glowRef.current.style.opacity = "1";
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }
    };

    const handleLeave = () => {
      visible.current = false;
      if (glowRef.current) glowRef.current.style.opacity = "0";
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    let rafId: number;
    const animate = () => {
      // Smooth lerp for glow
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.left = `${pos.current.x}px`;
        glowRef.current.style.top = `${pos.current.y}px`;
      }
      // Dot follows exactly
      if (dotRef.current) {
        dotRef.current.style.left = `${target.current.x}px`;
        dotRef.current.style.top = `${target.current.y}px`;
      }
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow hidden md:block" style={{ opacity: 0 }} />
      <div ref={dotRef} className="cursor-dot hidden md:block" style={{ opacity: 0 }} />
    </>
  );
}
