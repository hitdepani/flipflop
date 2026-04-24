"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Bit = 0 | 1;
type FFType = "D" | "SR" | "JK" | "T";

interface Signal {
  name: string;
  bits: Bit[];
  color: string;
}

function parseSequence(seq: string, len: number): Bit[] {
  return Array.from({ length: len }, (_, i) => {
    const c = seq[i % seq.length];
    return c === "1" ? 1 : 0;
  });
}

function generateClock(len: number): Bit[] {
  return Array.from({ length: len }, (_, i) => (i % 2 === 0 ? 0 : 1));
}

function computeFFOutput(type: FFType, inputs: Record<string, Bit[]>, clk: Bit[], len: number): Bit[] {
  const result: Bit[] = [0];
  let Q: Bit = 0;
  for (let i = 1; i < len; i++) {
    const rising = clk[i] === 1 && clk[i - 1] === 0;
    if (rising) {
      switch (type) {
        case "D": Q = inputs.A[i]; break;
        case "T": if (inputs.A[i] === 1) Q = (1 - Q) as Bit; break;
        case "SR": {
          const S = inputs.A[i], R = inputs.B?.[i] ?? 0;
          if (S === 1 && R === 0) Q = 1;
          else if (S === 0 && R === 1) Q = 0;
          break;
        }
        case "JK": {
          const J = inputs.A[i], K = inputs.B?.[i] ?? 0;
          if (J === 1 && K === 1) Q = (1 - Q) as Bit;
          else if (J === 1) Q = 1;
          else if (K === 1) Q = 0;
          break;
        }
      }
    }
    result.push(Q);
  }
  return result;
}

const TRACK_H = 52;
const WAVEFORM_COLORS = ["#e8a849", "#60a5fa", "#34d399", "#f472b6", "#fb923c"];

function WaveformTrack({ signal, width, animProgress }: { signal: Signal; width: number; animProgress: number }) {
  const n = Math.floor(signal.bits.length * animProgress);
  const bitW = Math.max(width / signal.bits.length, 20);

  return (
    <div className="relative" style={{ height: TRACK_H }}>
      <div className="absolute left-0 top-0 bottom-0 w-20 flex items-center px-3">
        <span className="font-mono text-xs font-bold truncate" style={{ color: signal.color }}>
          {signal.name}
        </span>
      </div>
      <div className="absolute left-20 right-0 top-0 bottom-0 overflow-hidden">
        <svg width="100%" height={TRACK_H} viewBox={`0 0 ${Math.max(width - 80, 200)} ${TRACK_H}`} preserveAspectRatio="none">
          {signal.bits.slice(0, n).map((bit, i) => {
            const x = i * bitW;
            const y = bit === 1 ? 8 : 36;
            const nextBit = signal.bits[i + 1];
            const nextY = nextBit === 1 ? 8 : 36;
            return (
              <g key={i}>
                <line
                  x1={x} y1={y}
                  x2={x + bitW} y2={y}
                  stroke={signal.color}
                  strokeWidth="2"
                  style={{ filter: `drop-shadow(0 0 3px ${signal.color})` }}
                />
                {i < n - 1 && y !== nextY && (
                  <line
                    x1={x + bitW} y1={y}
                    x2={x + bitW} y2={nextY}
                    stroke={signal.color}
                    strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 3px ${signal.color})` }}
                  />
                )}
                <text
                  x={x + bitW / 2} y={y === 8 ? 22 : 30}
                  textAnchor="middle"
                  fill={`${signal.color}80`}
                  fontSize="8"
                  fontFamily="JetBrains Mono,monospace"
                >
                  {bit}
                </text>
              </g>
            );
          })}
          {animProgress < 1 && (
            <line
              x1={n * bitW} y1="0"
              x2={n * bitW} y2={TRACK_H}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
          )}
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 border-l border-white/[0.05]" />
    </div>
  );
}

const PRESETS = [
  { name: "D Flip-Flop", type: "D" as FFType, seqA: "01101001", seqB: "" },
  { name: "T Toggle Counter", type: "T" as FFType, seqA: "11111111", seqB: "" },
  { name: "JK Universal", type: "JK" as FFType, seqA: "01101011", seqB: "10010110" },
  { name: "SR Set-Reset", type: "SR" as FFType, seqA: "01000100", seqB: "00010001" },
];

export default function TimingDiagram() {
  const [ffType, setFFType] = useState<FFType>("D");
  const [seqA, setSeqA] = useState("01101001");
  const [seqB, setSeqB] = useState("");
  const [length, setLength] = useState(16);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [animProgress, setAnimProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const generate = useCallback(() => {
    const clk = generateClock(length);
    const A = parseSequence(seqA || "01010101", length);
    const B = parseSequence(seqB || "00110011", length);

    const needsB = ["SR", "JK"].includes(ffType);
    const output = computeFFOutput(ffType, { A, B }, clk, length);

    const newSignals: Signal[] = [
      { name: "CLK", bits: clk, color: WAVEFORM_COLORS[0] },
      { name: ffType === "D" ? "D" : ffType === "T" ? "T" : ffType === "SR" ? "S" : "J", bits: A, color: WAVEFORM_COLORS[1] },
      ...(needsB ? [{ name: ffType === "SR" ? "R" : "K", bits: B, color: WAVEFORM_COLORS[2] }] : []),
      { name: "Q", bits: output, color: WAVEFORM_COLORS[3] },
    ];

    setSignals(newSignals);
    setAnimProgress(0);
    setIsAnimating(true);
    setGenerated(true);

    let start: number | null = null;
    const duration = 2000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      setAnimProgress(prog);
      if (prog < 1) requestAnimationFrame(step);
      else setIsAnimating(false);
    };
    requestAnimationFrame(step);
  }, [ffType, seqA, seqB, length]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFFType(preset.type);
    setSeqA(preset.seqA);
    setSeqB(preset.seqB);
    setTimeout(() => generate(), 50);
  };

  return (
    <section id="timing" className="relative py-24 px-6" style={{ background: "linear-gradient(180deg, #0f1419 0%, #0e1218 100%)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="section-badge mb-4">
            <span className="w-2 h-2 rounded-full" style={{ background: "#f472b6" }} />
            Section 04
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span className="text-white">Timing </span>
            <span style={{ color: "#f472b6", textShadow: "0 0 30px rgba(244,114,182,0.3)" }}>Diagrams</span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl">
            Define input sequences and watch waveforms animate across the timeline.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 space-y-4"
          >
            {/* FF Type */}
            <div className="glass-card p-4">
              <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Flip-Flop Type</div>
              <div className="grid grid-cols-2 gap-2">
                {(["D", "T", "SR", "JK"] as FFType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFFType(t)}
                    className="py-2 rounded-lg font-mono text-sm cursor-pointer"
                    style={{
                      background: ffType === t ? "rgba(244,114,182,0.12)" : "rgba(255,255,255,0.04)",
                      border: ffType === t ? "1px solid rgba(244,114,182,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      color: ffType === t ? "#f472b6" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="glass-card p-4">
              <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Quick Presets</div>
              <div className="space-y-2">
                {PRESETS.map((p) => (
                  <motion.button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    whileHover={{ x: 4 }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <span className="text-[#f472b6] font-mono mr-2">{p.type}</span>
                    {p.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input sequences */}
            <div className="glass-card p-4 space-y-3">
              <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Input Sequences</div>

              <div>
                <label className="text-xs text-white/50 mb-1 block font-mono">
                  {ffType === "D" ? "D" : ffType === "T" ? "T" : ffType === "SR" ? "S" : "J"} input
                </label>
                <input
                  value={seqA}
                  onChange={(e) => setSeqA(e.target.value.replace(/[^01]/g, ""))}
                  maxLength={20}
                  className="w-full px-3 py-2 rounded-lg font-mono text-sm"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e8a849",
                    outline: "none",
                  }}
                  placeholder="01010101"
                />
              </div>

              {["SR", "JK"].includes(ffType) && (
                <div>
                  <label className="text-xs text-white/50 mb-1 block font-mono">
                    {ffType === "SR" ? "R" : "K"} input
                  </label>
                  <input
                    value={seqB}
                    onChange={(e) => setSeqB(e.target.value.replace(/[^01]/g, ""))}
                    maxLength={20}
                    className="w-full px-3 py-2 rounded-lg font-mono text-sm"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#60a5fa",
                      outline: "none",
                    }}
                    placeholder="10101010"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-white/50 mb-1 block font-mono">Timeline length: {length}</label>
                <input
                  type="range"
                  min={8} max={32} step={2}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#f472b6" }}
                />
              </div>

              <motion.button
                onClick={generate}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(244,114,182,0.15), rgba(232,168,73,0.15))",
                  border: "1px solid rgba(244,114,182,0.4)",
                  color: "#f472b6",
                }}
              >
                {isAnimating ? "Generating..." : "▶ Generate Waveform"}
              </motion.button>
            </div>
          </motion.div>

          {/* Waveform display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <div
              ref={containerRef}
              className="glass-card overflow-hidden"
              style={{ minHeight: 320 }}
            >
              {!generated ? (
                <div className="flex items-center justify-center h-80 text-white/20 text-center">
                  <div>
                    <div className="text-5xl mb-4">≋</div>
                    <div className="font-mono text-sm">Configure inputs and click Generate</div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Time ruler */}
                  <div className="flex border-b border-white/[0.06] h-8 pl-20">
                    {Array.from({ length: length }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 flex items-center justify-center text-xs font-mono text-white/20"
                        style={{ borderRight: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        {i % 4 === 0 ? i : ""}
                      </div>
                    ))}
                  </div>

                  {/* Tracks */}
                  {signals.map((sig, i) => (
                    <motion.div
                      key={sig.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border-b border-white/[0.04]"
                    >
                      <WaveformTrack signal={sig} width={containerW} animProgress={animProgress} />
                    </motion.div>
                  ))}

                  {/* Legend */}
                  <div className="p-4 flex flex-wrap gap-4">
                    {signals.map((sig) => (
                      <div key={sig.name} className="flex items-center gap-2 text-xs font-mono">
                        <div
                          className="w-6 h-0.5 rounded"
                          style={{
                            background: sig.color,
                            boxShadow: `0 0 6px ${sig.color}`,
                          }}
                        />
                        <span style={{ color: sig.color }}>{sig.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Tips */}
            {generated && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-3 rounded-xl text-xs text-white/30 leading-relaxed"
                style={{ background: "rgba(244,114,182,0.04)", border: "1px solid rgba(244,114,182,0.1)" }}
              >
                💡 Waveform reads left to right over time. Clock rising edges (↑) trigger state changes in Q. 
                Vertical transitions show state changes. Try different presets to see how each flip-flop behaves!
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
