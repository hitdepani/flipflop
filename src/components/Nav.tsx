"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/logic-gates", label: "Logic Gates", color: "#f59e0b" },
  { href: "/flip-flops", label: "Flip-Flops", color: "#39ff14" },
  { href: "/circuit-builder", label: "Circuit Builder", color: "#60a5fa" },
  { href: "/timing-diagrams", label: "Timing Diagrams", color: "#f472b6" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pt-4"
    >
      <div
        className="flex items-center justify-between gap-8 px-6 py-3 rounded-2xl transition-all duration-300 w-full max-w-5xl"
        style={{
          background: scrolled ? "rgba(6,9,14,0.85)" : "rgba(6,9,14,0.4)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-black text-xl tracking-tight cursor-pointer"
          style={{ background: "linear-gradient(135deg,#f59e0b,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          FLIP<span className="text-white" style={{ WebkitTextFillColor: "white" }}>LOGIC</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer group"
                style={{
                  color: isActive ? item.color : "rgba(255,255,255,0.6)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}
                  />
                )}
                <span className="relative z-10 group-hover:text-white transition-colors">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* "Live Lab" badge & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" style={{ boxShadow: "0 0 10px #39ff14" }} />
            <span className="text-xs font-mono font-bold text-white/70 uppercase tracking-widest">Live</span>
          </div>

          <button
            className="md:hidden text-white/80 hover:text-white transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-6 right-6 rounded-2xl p-4 glass-card overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all"
                    style={{ 
                      color: isActive ? item.color : "white",
                      background: isActive ? `${item.color}15` : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
