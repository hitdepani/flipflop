"use client";

import AmbientScene from "@/components/AmbientScene";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  Gauge,
  GitBranch,
  Layers3,
  MousePointer2,
  Play,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

const modules = [
  { href: "/logic-gates", title: "Logic Gates Playground", icon: Cpu, color: "#22d3ee", copy: "Live gate diagrams, animated signal flow, truth-table focus states, and guided Boolean insight." },
  { href: "/flip-flops", title: "Flip-Flop Simulator", icon: GitBranch, color: "#a78bfa", copy: "Clock pulses, state transitions, oscilloscope-style output history, and sequential logic controls." },
  { href: "/circuit-builder", title: "Circuit Builder", icon: CircuitBoard, color: "#41f29a", copy: "A node editor with snapping, zoom, minimap, glowing active wires, context actions, and component search." },
  { href: "/timing-diagrams", title: "Timing Diagram Visualizer", icon: Activity, color: "#f6b84b", copy: "Professional waveform rendering with editable sequences, playback, exports, and timing inspection." },
];

const features = [
  ["Signal-first visuals", "Every state change is visible through animated pulses, focused rows, and live readouts."],
  ["Node-native workflow", "Build from components, wire by ports, pan the canvas, zoom into systems, and inspect outputs."],
  ["Learning built in", "Concept cards, challenges, and smart explanations keep the lesson connected to the simulator."],
  ["Premium motion system", "Spring interactions, ambient lighting, micro hover states, and responsive mobile navigation."],
];

const flow = [
  "Explore gates",
  "Compose circuits",
  "Clock memory",
  "Inspect waveforms",
  "Practice patterns",
];

function WavePreview() {
  const rows = [
    { name: "CLK", color: "#f6b84b", y1: 34, y2: 12, pattern: "M0 34 H28 V12 H58 V34 H88 V12 H118 V34 H148 V12 H178 V34 H208 V12 H238" },
    { name: "A", color: "#22d3ee", y1: 30, y2: 14, pattern: "M0 30 H54 V14 H108 V30 H162 V14 H238" },
    { name: "Q", color: "#41f29a", y1: 32, y2: 13, pattern: "M0 32 H88 V13 H178 V32 H238" },
  ];

  return (
    <div className="premium-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="mono-chip">live waveform</span>
        <span className="flex items-center gap-2 text-xs font-bold text-[#41f29a]">
          <span className="h-2 w-2 rounded-full bg-[#41f29a] shadow-[0_0_14px_rgba(65,242,154,0.8)]" />
          Running
        </span>
      </div>
      <svg viewBox="0 0 330 168" className="h-44 w-full">
        <defs>
          <linearGradient id="waveGrid" x1="0" x2="1">
            <stop stopColor="#22d3ee" stopOpacity="0.16" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={42 + i * 24} y1="0" x2={42 + i * 24} y2="168" stroke="rgba(148,163,184,0.08)" />
        ))}
        {rows.map((row, i) => (
          <g key={row.name} transform={`translate(0 ${i * 52})`}>
            <text x="0" y="28" fill={row.color} fontFamily="JetBrains Mono" fontSize="12" fontWeight="700">
              {row.name}
            </text>
            <path d={row.pattern} transform="translate(46 0)" fill="none" stroke={row.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter={`drop-shadow(0 0 6px ${row.color})`} />
          </g>
        ))}
        <motion.line
          x1="54"
          x2="54"
          y1="0"
          y2="168"
          stroke="url(#waveGrid)"
          strokeWidth="18"
          animate={{ x1: [54, 290, 54], x2: [54, 290, 54] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <div className="page-transition relative overflow-hidden">
      <section className="relative min-h-[100svh] overflow-hidden px-4 pb-12 pt-28 md:pt-32">
        <AmbientScene />
        <div className="section-shell grid min-h-[calc(100svh-140px)] items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="eyebrow mb-6">
              <Zap className="h-3.5 w-3.5 text-cyan-200" />
              Digital electronics, redesigned
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              FlipLogic
              <span className="gradient-text block">turns circuits into motion.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              A cinematic dark engineering studio for learning gates, memory, timing, and full circuit behavior through interactive simulations that feel immediate and alive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="premium-button primary" href="/circuit-builder">
                Launch Builder
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="premium-button" href="/logic-gates">
                <Play className="h-4 w-4" />
                Explore Gates
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["144hz", "motion feel"],
                ["9", "modules"],
                ["R3F", "ambient scene"],
                ["0/1", "signal truth"],
              ].map(([value, label]) => (
                <div key={label} className="glass-panel-soft px-4 py-3">
                  <div className="font-mono text-lg font-black text-white">{value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/36">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative">
            <div className="premium-card p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">FlipLogic Studio</div>
                    <div className="font-mono text-[11px] text-white/36">routing / sequential lab</div>
                  </div>
                </div>
                <span className="mono-chip">AUTO CLK</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
                <div className="canvas-grid relative h-[360px] overflow-hidden rounded-xl border border-white/10">
                  <div className="absolute left-8 top-10 rounded-xl border border-cyan-300/28 bg-[#07111e]/88 p-4 shadow-[0_0_32px_rgba(34,211,238,0.12)]">
                    <div className="font-mono text-xs font-black text-cyan-100">INPUT A</div>
                    <div className="mt-2 h-8 w-16 rounded-lg bg-[#41f29a]/14 text-center font-mono text-xl font-black leading-8 text-[#41f29a]">1</div>
                  </div>
                  <div className="absolute left-8 top-40 rounded-xl border border-purple-300/28 bg-[#100d1e]/88 p-4">
                    <div className="font-mono text-xs font-black text-purple-100">INPUT B</div>
                    <div className="mt-2 h-8 w-16 rounded-lg bg-white/6 text-center font-mono text-xl font-black leading-8 text-white/42">0</div>
                  </div>
                  <div className="absolute left-[47%] top-[32%] rounded-2xl border border-cyan-300/30 bg-[#07111e]/92 px-8 py-5 shadow-[0_0_54px_rgba(34,211,238,0.14)]">
                    <Cpu className="mx-auto mb-2 h-6 w-6 text-cyan-100" />
                    <div className="font-mono text-sm font-black text-white">XOR</div>
                    <div className="mt-1 text-center font-mono text-xs text-[#41f29a]">Y=1</div>
                  </div>
                  <div className="absolute right-10 top-[38%] rounded-xl border border-[#41f29a]/30 bg-[#06140e]/88 p-4">
                    <div className="font-mono text-xs font-black text-[#41f29a]">OUTPUT</div>
                    <div className="mx-auto mt-3 h-7 w-7 rounded-full bg-[#41f29a] shadow-[0_0_28px_rgba(65,242,154,0.9)]" />
                  </div>
                  <svg className="absolute inset-0 h-full w-full">
                    <path d="M100 78 C170 78 190 132 252 132" fill="none" stroke="#41f29a" strokeWidth="3" className="wire-flow" filter="drop-shadow(0 0 7px #41f29a)" />
                    <path d="M100 178 C164 178 188 154 252 154" fill="none" stroke="rgba(226,232,240,0.2)" strokeWidth="2" />
                    <path d="M402 142 C456 142 484 142 548 142" fill="none" stroke="#41f29a" strokeWidth="3" className="wire-flow" filter="drop-shadow(0 0 7px #41f29a)" />
                  </svg>
                  <div className="scan-line absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent" />
                </div>
                <div className="space-y-4">
                  <WavePreview />
                  <div className="glass-panel-soft p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                      <Sparkles className="h-4 w-4 text-amber-200" />
                      Smart insight
                    </div>
                    <p className="text-sm leading-6 text-white/54">
                      XOR is high because exactly one input is active. The output wire is pulsing and the truth-table row is locked to A=1, B=0.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell py-12 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="eyebrow mb-4">
              <Layers3 className="h-3.5 w-3.5 text-purple-200" />
              Product modules
            </div>
            <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">One coherent studio for every digital logic workflow.</h2>
          </div>
          <Link href="/learning" className="premium-button w-fit">
            View learning flow
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div key={module.href} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <Link href={module.href} className="premium-card group block h-full p-5">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]" style={{ color: module.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/28 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-black text-white">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/52">{module.copy}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section-shell grid gap-5 py-12 md:grid-cols-[0.8fr_1.2fr] md:py-20">
        <div>
          <div className="eyebrow mb-4">
            <Gauge className="h-3.5 w-3.5 text-cyan-200" />
            Why FlipLogic
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">Built like a professional tool, taught like a visual lab.</h2>
          <p className="mt-5 text-sm leading-7 text-white/54 md:text-base">
            The old interface treated each lesson as a static panel. This redesign turns the platform into a spatial simulator with consistent controls, stronger hierarchy, and feedback that makes binary behavior feel physical.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(([title, copy]) => (
            <div key={title} className="glass-panel p-5">
              <CheckCircle2 className="mb-5 h-5 w-5 text-[#41f29a]" />
              <h3 className="font-black text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-12 md:py-20">
        <div className="premium-card overflow-hidden p-5 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="eyebrow mb-4">
                <BookOpen className="h-3.5 w-3.5 text-amber-200" />
                Learning flow
              </div>
              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">From first truth table to complete sequential system.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="mono-chip">
                <MousePointer2 className="h-3.5 w-3.5" />
                interactive
              </span>
              <span className="mono-chip">
                <Boxes className="h-3.5 w-3.5" />
                component based
              </span>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {flow.map((item, index) => (
              <div key={item} className="relative rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-8 font-mono text-xs font-black text-cyan-200">0{index + 1}</div>
                <div className="font-bold text-white">{item}</div>
                {index < flow.length - 1 && <div className="absolute right-[-10px] top-1/2 hidden h-px w-5 bg-cyan-200/30 md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-4 py-12 md:grid-cols-3 md:py-20">
        {["The circuit builder finally feels like a real engineering surface.", "The timing diagrams make edge-triggered behavior click instantly.", "This is the kind of lab I wish I had before HDL."].map((quote, index) => (
          <div key={quote} className="glass-panel p-5">
            <div className="mb-4 flex gap-1 text-amber-200">{"*****"}</div>
            <p className="text-sm leading-7 text-white/62">{quote}</p>
            <div className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-white/32">Beta learner {index + 1}</div>
          </div>
        ))}
      </section>

      <section className="section-shell pb-24 pt-12 md:pb-28">
        <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="eyebrow mb-4">FAQ</div>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">Designed for depth, still fast on the glass.</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Is it only a landing page?", "No. The simulator modules are wired into real interactive pages with stateful controls, animated diagrams, and exports where relevant."],
              ["Does it work on mobile?", "Yes. Navigation becomes app-like, panels collapse into touch-friendly stacks, and the builder keeps the canvas usable with zoom controls."],
              ["Can I extend it?", "The app now has a reusable product shell, shared visual primitives, and dedicated routes for learning, components, challenges, and settings."],
            ].map(([question, answer]) => (
              <div key={question} className="glass-panel p-5">
                <h3 className="font-black text-white">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 px-4 py-8">
        <div className="section-shell flex flex-col justify-between gap-4 text-sm text-white/42 md:flex-row md:items-center">
          <div className="font-black text-white">FlipLogic</div>
          <div className="font-mono text-xs">Digital electronics lab / premium simulator / built for signal clarity</div>
        </div>
      </footer>
    </div>
  );
}
