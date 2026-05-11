"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Download, Pause, Play, RotateCcw, SlidersHorizontal, Sparkles, Waves, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Bit = 0 | 1;
type FFType = "D" | "T" | "SR" | "JK";

type Signal = {
  name: string;
  bits: Bit[];
  color: string;
};

const COLORS = ["#f6b84b", "#22d3ee", "#41f29a", "#a78bfa", "#fb7185"];
const PRESETS = [
  { name: "D Register", type: "D" as FFType, a: "01101001", b: "" },
  { name: "T Counter", type: "T" as FFType, a: "11111111", b: "" },
  { name: "SR Latch Edge", type: "SR" as FFType, a: "01000100", b: "00010001" },
  { name: "JK Universal", type: "JK" as FFType, a: "01101011", b: "10010110" },
];

function parseBits(input: string, length: number): Bit[] {
  const clean = input.replace(/[^01]/g, "") || "0";
  return Array.from({ length }, (_, index) => (clean[index % clean.length] === "1" ? 1 : 0));
}

function clock(length: number): Bit[] {
  return Array.from({ length }, (_, index) => (index % 2 === 0 ? 0 : 1));
}

function outputFor(type: FFType, a: Bit[], b: Bit[], clk: Bit[], length: number): Bit[] {
  let q: Bit = 0;
  const out: Bit[] = [q];
  for (let i = 1; i < length; i += 1) {
    const rising = clk[i] === 1 && clk[i - 1] === 0;
    if (rising) {
      if (type === "D") q = a[i];
      if (type === "T" && a[i]) q = (1 - q) as Bit;
      if (type === "SR") {
        if (a[i] && !b[i]) q = 1;
        if (!a[i] && b[i]) q = 0;
      }
      if (type === "JK") {
        if (a[i] && b[i]) q = (1 - q) as Bit;
        else if (a[i]) q = 1;
        else if (b[i]) q = 0;
      }
    }
    out.push(q);
  }
  return out;
}

function WaveTrack({ signal, zoom, cursor }: { signal: Signal; zoom: number; cursor: number }) {
  const step = 48 * zoom;
  const width = signal.bits.length * step + 40;
  return (
    <div className="relative border-b border-white/8">
      <div className="absolute bottom-0 left-0 top-0 z-10 flex w-24 items-center border-r border-white/8 bg-[#070b13]/90 px-4">
        <span className="font-mono text-xs font-black" style={{ color: signal.color }}>{signal.name}</span>
      </div>
      <div className="overflow-x-auto pl-24">
        <svg viewBox={`0 0 ${width} 70`} width={width} height="70" className="block">
          {signal.bits.map((bit, index) => {
            const x = index * step + 16;
            const y = bit ? 16 : 52;
            const next = signal.bits[index + 1] ?? bit;
            const ny = next ? 16 : 52;
            return (
              <g key={index}>
                <line x1={x} x2={x + step} y1={y} y2={y} stroke={signal.color} strokeWidth="3" strokeLinecap="round" filter={`drop-shadow(0 0 5px ${signal.color})`} />
                {ny !== y && <line x1={x + step} x2={x + step} y1={y} y2={ny} stroke={signal.color} strokeWidth="3" strokeLinecap="round" />}
                <text x={x + step / 2} y={bit ? 37 : 42} textAnchor="middle" fill={`${signal.color}88`} fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">{bit}</text>
              </g>
            );
          })}
          <motion.rect x={cursor * step + 16} y="0" width="3" height="70" fill="#ffffff" opacity="0.42" />
        </svg>
      </div>
    </div>
  );
}

export default function TimingDiagram() {
  const [type, setType] = useState<FFType>("JK");
  const [seqA, setSeqA] = useState("01101011");
  const [seqB, setSeqB] = useState("10010110");
  const [length, setLength] = useState(18);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(0);
  const svgRef = useRef<HTMLDivElement>(null);

  const signals = useMemo<Signal[]>(() => {
    const clk = clock(length);
    const a = parseBits(seqA, length);
    const b = parseBits(seqB, length);
    const out = outputFor(type, a, b, clk, length);
    const needsB = type === "SR" || type === "JK";
    return [
      { name: "CLK", bits: clk, color: COLORS[0] },
      { name: type === "D" ? "D" : type === "T" ? "T" : type === "SR" ? "S" : "J", bits: a, color: COLORS[1] },
      ...(needsB ? [{ name: type === "SR" ? "R" : "K", bits: b, color: COLORS[2] }] : []),
      { name: "Q", bits: out, color: COLORS[3] },
    ];
  }, [length, seqA, seqB, type]);

  const exportSvg = useCallback(() => {
    const container = svgRef.current;
    if (!container) return;
    const text = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${signals.length * 76 + 40}"><rect width="100%" height="100%" fill="#050812"/><text x="24" y="28" fill="#fff" font-family="JetBrains Mono" font-size="16">FlipLogic Timing Diagram</text></svg>`;
    const blob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fliplogic-timing.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [signals.length]);

  const tick = () => setCursor((value) => (value + 1) % length);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(tick, 520);
    return () => window.clearInterval(timer);
  }, [length, playing]);

  return (
    <section className="page-shell page-transition">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="eyebrow mb-4">
            <Waves className="h-3.5 w-3.5 text-amber-200" />
            Timing Diagram Visualizer
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">Oscilloscope-grade waveforms for sequential logic.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/54 md:text-base">
            Define input streams, zoom the timeline, scrub the cursor, and export clean waveforms for notes or review.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="premium-button primary" onClick={() => { setPlaying((value) => !value); tick(); }}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </button>
          <button className="premium-button" onClick={tick}><Activity className="h-4 w-4" />Step</button>
          <button className="premium-button" onClick={exportSvg}><Download className="h-4 w-4" />SVG</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
        <aside className="grid gap-4">
          <div className="premium-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cyan-200" />
              <h3 className="font-black text-white">Controls</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["D", "T", "SR", "JK"] as FFType[]).map((item) => (
                <button key={item} onClick={() => setType(item)} className={`rounded-xl border px-3 py-2 font-mono text-sm font-black ${type === item ? "border-cyan-300/34 bg-cyan-300/12 text-white" : "border-white/10 bg-white/[0.035] text-white/48"}`}>{item}</button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block font-mono text-xs font-black uppercase tracking-widest text-white/34">{type === "D" ? "D" : type === "T" ? "T" : type === "SR" ? "S" : "J"} sequence</span>
                <input value={seqA} onChange={(event) => setSeqA(event.target.value.replace(/[^01]/g, ""))} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-cyan-100 outline-none" />
              </label>
              {(type === "SR" || type === "JK") && (
                <label className="block">
                  <span className="mb-1 block font-mono text-xs font-black uppercase tracking-widest text-white/34">{type === "SR" ? "R" : "K"} sequence</span>
                  <input value={seqB} onChange={(event) => setSeqB(event.target.value.replace(/[^01]/g, ""))} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-[#41f29a] outline-none" />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block font-mono text-xs font-black uppercase tracking-widest text-white/34">timeline {length}</span>
                <input type="range" min="8" max="32" step="2" value={length} onChange={(event) => setLength(Number(event.target.value))} className="w-full accent-cyan-300" />
              </label>
            </div>
          </div>

          <div className="premium-card p-4">
            <h3 className="mb-3 font-black text-white">Presets</h3>
            <div className="space-y-2">
              {PRESETS.map((preset) => (
                <button key={preset.name} onClick={() => { setType(preset.type); setSeqA(preset.a); setSeqB(preset.b); setCursor(0); }} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-left text-sm text-white/62 hover:border-cyan-300/28 hover:text-white">
                  <span>{preset.name}</span>
                  <span className="font-mono text-xs text-cyan-200">{preset.type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Edge insight
            </div>
            <p className="text-sm leading-6 text-white/52">Q updates only on rising CLK edges. Scrub or step the cursor to line up input state with output transitions.</p>
          </div>
        </aside>

        <div className="premium-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 p-4">
            <div>
              <h3 className="font-black text-white">Waveform Renderer</h3>
              <p className="text-sm text-white/38">Cursor at sample {cursor}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="icon-button" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <span className="mono-chip">{Math.round(zoom * 100)}%</span>
              <button className="icon-button" onClick={() => setZoom((value) => Math.min(1.8, value + 0.1))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <button className="icon-button" onClick={() => setCursor(0)} aria-label="Reset cursor"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div ref={svgRef} className="bg-[#050812]">
            <div className="flex h-9 items-center border-b border-white/8 pl-24">
              {Array.from({ length }).map((_, index) => (
                <button key={index} onClick={() => setCursor(index)} className={`h-full border-r border-white/8 px-3 font-mono text-xs ${cursor === index ? "bg-cyan-300/10 text-white" : "text-white/28"}`}>
                  {index}
                </button>
              ))}
            </div>
            <AnimatePresence mode="popLayout">
              {signals.map((signal) => (
                <motion.div key={signal.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <WaveTrack signal={signal} zoom={zoom} cursor={cursor} />
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex flex-wrap gap-3 p-4">
              {signals.map((signal) => (
                <span key={signal.name} className="mono-chip" style={{ color: signal.color }}>
                  <span className="h-1.5 w-5 rounded-full" style={{ background: signal.color, boxShadow: `0 0 8px ${signal.color}` }} />
                  {signal.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
