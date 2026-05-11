"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  CircuitBoard,
  Command,
  Cpu,
  GitBranch,
  Home,
  Menu,
  MoonStar,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const navItems = [
  { href: "/", label: "Home", icon: Home, key: "H" },
  { href: "/logic-gates", label: "Gates", icon: Cpu, key: "G" },
  { href: "/flip-flops", label: "Flip-Flops", icon: GitBranch, key: "F" },
  { href: "/circuit-builder", label: "Builder", icon: CircuitBoard, key: "B" },
  { href: "/timing-diagrams", label: "Timing", icon: Activity, key: "T" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);

  const active = useMemo(() => navItems.find((item) => isActive(pathname, item.href)) ?? navItems[0], [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((value) => !value);
      }
      if (event.key === "Escape") {
        setOpen(false);
        setPalette(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.21, 1, 0.23, 1] }}
        className="fixed left-0 right-0 top-0 z-50 px-3 pt-2 md:px-5"
      >
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between rounded-2xl border border-white/10 bg-[#050812]/78 px-2.5 shadow-[0_14px_54px_rgba(0,0,0,0.34)] backdrop-blur-2xl md:px-3">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.13)]">
              <BrainCircuit className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#41f29a] shadow-[0_0_12px_rgba(65,242,154,0.8)]" />
            </div>
            <div>
              <div className="text-[14px] font-black tracking-tight text-white">FlipLogic</div>
              <div className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-white/34 sm:block">signal studio</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 rounded-xl border border-white/8 bg-white/[0.035] p-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const activeItem = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold transition ${
                    activeItem ? "text-white" : "text-white/48 hover:text-white"
                  }`}
                >
                  {activeItem && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_26px_rgba(34,211,238,0.14)]"
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button className="icon-button hidden md:inline-flex" onClick={() => setPalette(true)} aria-label="Open command palette">
              <Search className="h-4 w-4" />
            </button>
            <Link href="/settings" className="icon-button hidden md:inline-flex" aria-label="Settings">
              <MoonStar className="h-4 w-4" />
            </Link>
            <button className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <button className="premium-button compact hidden xl:inline-flex" onClick={() => setPalette(true)}>
              <Command className="h-4 w-4" />
              Cmd K
            </button>
          </div>
        </div>
      </motion.header>

      <aside className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1.5 rounded-2xl border border-white/10 bg-[#050812]/68 p-1.5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl 2xl:flex">
        {navItems.slice(1).map((item) => {
          const Icon = item.icon;
          const activeItem = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                activeItem ? "bg-cyan-300/12 text-cyan-100" : "text-white/42 hover:bg-white/8 hover:text-white"
              }`}
              title={item.label}
            >
              {activeItem && <span className="absolute inset-0 rounded-xl border border-cyan-300/25 shadow-[0_0_22px_rgba(34,211,238,0.16)]" />}
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </aside>

      <nav className="fixed bottom-3 left-3 right-3 z-50 grid grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-[#050812]/86 p-1 shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:hidden">
        {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]].map((item) => {
          const Icon = item.icon;
          const activeItem = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex h-12 flex-col items-center justify-center rounded-xl text-[10px] font-bold ${activeItem ? "bg-cyan-300/12 text-white" : "text-white/45"}`}>
              <Icon className="mb-0.5 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed bottom-0 right-0 top-0 z-[80] w-[min(380px,92vw)] border-l border-white/10 bg-[#050812]/94 p-5 shadow-[-24px_0_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-white">Navigation</div>
                  <div className="text-xs text-white/42">Active: {active.label}</div>
                </div>
                <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close navigation">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const activeItem = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                        activeItem ? "border-cyan-300/24 bg-cyan-300/10 text-white" : "border-white/8 bg-white/[0.03] text-white/62"
                      }`}
                    >
                      <span className="flex items-center gap-3 font-semibold">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <span className="font-mono text-xs text-white/34">{item.key}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {palette && (
          <motion.div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/58 px-4 pt-24 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPalette(false)}>
            <motion.div
              initial={{ y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-[#070b13]/96 shadow-[0_34px_110px_rgba(0,0,0,0.6)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-white/8 px-4 py-4">
                <Command className="h-5 w-5 text-cyan-200" />
                <div className="flex-1 text-sm font-semibold text-white/72">Jump to a FlipLogic workspace</div>
        <span className="mono-chip">Ctrl K</span>
              </div>
              <div className="grid gap-2 p-3 sm:grid-cols-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setPalette(false)} className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3 transition hover:border-cyan-300/26 hover:bg-cyan-300/8">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.045] text-white/72 group-hover:text-cyan-100">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-white">{item.label}</span>
                        <span className="text-xs text-white/38">Shortcut {item.key}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-t border-white/8 px-4 py-3 text-xs text-white/36">
                <Sparkles className="h-4 w-4 text-amber-200/70" />
                <span>AI suggestions, component search, and simulator shortcuts share one command surface.</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
