"use client";

import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  Clock3,
  Cpu,
  Gamepad2,
  GitBranch,
  MoonStar,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Waves,
} from "lucide-react";

type PageKind = "components" | "learning" | "challenges" | "settings";

const DATA: Record<PageKind, {
  eyebrow: string;
  title: string;
  copy: string;
  icon: typeof Boxes;
  cards: Array<{ title: string; copy: string; icon: typeof Cpu; accent: string }>;
}> = {
  components: {
    eyebrow: "Component Library",
    title: "A premium catalog for every logic primitive.",
    copy: "Browse IO, gates, flip-flops, clocks, displays, and reusable subcircuits before dropping them into the builder.",
    icon: Boxes,
    cards: [
      { title: "Logic Gates", copy: "AND, OR, NOT, NAND, NOR, XOR, and XNOR with symbols, timing behavior, and truth tables.", icon: Cpu, accent: "#22d3ee" },
      { title: "Sequential Memory", copy: "SR, JK, D, and T flip-flops with edge-triggered state previews.", icon: GitBranch, accent: "#a78bfa" },
      { title: "Signal IO", copy: "Inputs, outputs, clocks, probes, and labeled buses for canvas composition.", icon: CircuitBoard, accent: "#41f29a" },
      { title: "Waveform Blocks", copy: "Reusable timing patterns for counters, registers, and pulse trains.", icon: Waves, accent: "#f6b84b" },
    ],
  },
  learning: {
    eyebrow: "Learning Mode",
    title: "Guided lessons that stay connected to the simulator.",
    copy: "Move from concept to live circuit without losing context. Each lesson includes a visual model, experiment, and challenge.",
    icon: BookOpen,
    cards: [
      { title: "Foundations", copy: "Binary states, voltage intuition, Boolean expressions, and truth-table reading.", icon: BookOpen, accent: "#22d3ee" },
      { title: "Gate Composition", copy: "Build adders, multiplexers, encoders, and decoders from primitive gates.", icon: Cpu, accent: "#41f29a" },
      { title: "Sequential Logic", copy: "Clock edges, memory, metastability, counters, and registers.", icon: Clock3, accent: "#a78bfa" },
      { title: "EDA Workflow", copy: "From schematic thinking to timing analysis and iterative debugging.", icon: ShieldCheck, accent: "#f6b84b" },
    ],
  },
  challenges: {
    eyebrow: "Challenges",
    title: "Practice circuits with immediate visual feedback.",
    copy: "Solve focused engineering puzzles, compare outputs against expected waveforms, and build confidence through repetition.",
    icon: Gamepad2,
    cards: [
      { title: "Truth Table Sprint", copy: "Match outputs for random gate combinations under time pressure.", icon: Trophy, accent: "#f6b84b" },
      { title: "Build a Half Adder", copy: "Wire XOR and AND gates to produce sum and carry outputs.", icon: CircuitBoard, accent: "#22d3ee" },
      { title: "JK Counter", copy: "Use flip-flops and a clock to create a two-bit counting sequence.", icon: GitBranch, accent: "#a78bfa" },
      { title: "Waveform Detective", copy: "Infer the missing input sequence from Q and CLK traces.", icon: Waves, accent: "#41f29a" },
    ],
  },
  settings: {
    eyebrow: "Settings / Theme Engine",
    title: "Tune the studio to your workflow.",
    copy: "Control density, glow strength, motion, grid behavior, and theme accents from one polished settings surface.",
    icon: MoonStar,
    cards: [
      { title: "Theme Accent", copy: "Electric blue, cyan, purple, amber, and high-contrast modes.", icon: Palette, accent: "#22d3ee" },
      { title: "Motion Profile", copy: "Balanced, cinematic, reduced motion, or performance-first animation profiles.", icon: Sparkles, accent: "#a78bfa" },
      { title: "Canvas Behavior", copy: "Snap size, minimap visibility, wire pulse speed, and zoom sensitivity.", icon: SlidersHorizontal, accent: "#41f29a" },
      { title: "Learning Alerts", copy: "Challenge reminders, lesson progress, and completion highlights.", icon: Bell, accent: "#f6b84b" },
    ],
  },
};

export default function PlatformModulePage({ kind }: { kind: PageKind }) {
  const data = DATA[kind];
  const Icon = data.icon;
  return (
    <section className="page-shell page-transition">
      <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <div className="eyebrow mb-4">
            <Icon className="h-3.5 w-3.5 text-cyan-200" />
            {data.eyebrow}
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">{data.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/54 md:text-base">{data.copy}</p>
        </div>
        <div className="premium-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="mono-chip">FlipLogic module</span>
            <span className="mono-chip">responsive</span>
          </div>
          <div className="canvas-grid h-56 rounded-2xl border border-white/10 p-5">
            <div className="grid h-full grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="mb-8 h-2 w-12 rounded-full bg-cyan-200/40" />
                  <div className="h-16 rounded-xl border border-white/10 bg-black/20" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.cards.map((card, index) => {
          const CardIcon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="premium-card p-5">
              <div className="mb-12 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]" style={{ color: card.accent }}>
                <CardIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/52">{card.copy}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {["Consistent command surfaces", "Mobile app-like navigation", "Production-ready information architecture"].map((item) => (
          <div key={item} className="glass-panel-soft p-4">
            <CheckCircle2 className="mb-3 h-4 w-4 text-[#41f29a]" />
            <div className="text-sm font-bold text-white">{item}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
