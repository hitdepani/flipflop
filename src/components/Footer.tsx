"use client";

import { motion } from "framer-motion";

const links = [
  { id: "gate-lab", label: "Gate Lab" },
  { id: "flipflop", label: "Flip-Flop" },
  { id: "circuit-builder", label: "Circuit Builder" },
  { id: "timing", label: "Timing Diagrams" },
];

export default function Footer() {
  return (
    <footer className="relative py-16 px-6 border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-black mb-2"
              style={{ background: "linear-gradient(135deg,#e8a849,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              FLIPLOGIC
            </div>
            <p className="text-sm text-white/30">
              An interactive simulation lab for digital electronics.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2 justify-center">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            Built with React · Framer Motion · Next.js
          </div>
        </div>

        <div className="section-divider my-8" />

        <div className="text-center text-xs text-white/20 font-mono space-y-1">
          <div>
            © 2025{" "}
            <span className="text-white/40 font-semibold">Hit Depani</span>
            {" "}·{" "}
            <span className="text-white/35">Marwadi University — ICT Department</span>
          </div>
          <div>FlipLogic · Digital Electronics Interactive Lab</div>
        </div>
      </div>

      {/* Background glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(232,168,73,0.08) 0%, transparent 70%)" }}
      />
    </footer>
  );
}
