"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "gate-lab", label: "Gate Lab", color: "#e8a849" },
  { id: "flipflop", label: "Flip-Flop", color: "#34d399" },
  { id: "circuit-builder", label: "Circuit Builder", color: "#60a5fa" },
  { id: "timing", label: "Timing Diagrams", color: "#f472b6" },
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);

      const sections = navItems.map((item) => document.getElementById(item.id));
      let current = "";
      sections.forEach((section) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            current = section.id;
          }
        }
      });
      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pt-4"
    >
      <div
        className="flex items-center gap-8 px-6 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: scrolled ? "rgba(15,20,25,0.9)" : "rgba(15,20,25,0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
          maxWidth: 700,
          width: "100%",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-black text-lg tracking-tight cursor-pointer"
          style={{ background: "linear-gradient(135deg,#e8a849,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          FLIP<span className="text-white" style={{ WebkitTextFillColor: "white" }}>LOGIC</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{
                color: active === item.id ? item.color : "rgba(255,255,255,0.5)",
              }}
            >
              {active === item.id && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                  }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* "Live Lab" badge */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
          LIVE
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden ml-auto text-white/60 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-current rounded" />
            <span className="block w-3.5 h-0.5 bg-current rounded" />
            <span className="block w-5 h-0.5 bg-current rounded" />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-6 right-6 rounded-2xl p-4 glass-card"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                style={{ color: item.color }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
